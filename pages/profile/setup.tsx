import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useLocale } from '@/lib/locale';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { Select } from '@/components/design-system/Select';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

const COUNTRIES = ['Pakistan','India','Bangladesh','United Arab Emirates','Saudi Arabia','United Kingdom','United States','Canada','Australia','New Zealand'];
const LEVELS: Array<'Beginner'|'Elementary'|'Pre-Intermediate'|'Intermediate'|'Upper-Intermediate'|'Advanced'> = ['Beginner','Elementary','Pre-Intermediate','Intermediate','Upper-Intermediate','Advanced'];
const TIME = ['1h/day','2h/day','Flexible'];
const PREFS = ['Listening','Reading','Writing','Speaking'];

/** ---- ISO week helpers for travel/festival/exam windows ---- */
function getWeekRange(isoWeek: string) {
  const [yearStr, weekStr] = isoWeek.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  if (!year || !week) return null;
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dayOfWeek = simple.getUTCDay();
  const start = new Date(simple);
  if (dayOfWeek <= 4) start.setUTCDate(simple.getUTCDate() - dayOfWeek + 1);
  else start.setUTCDate(simple.getUTCDate() + 8 - dayOfWeek);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start, end };
}
function dateToWeek(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNr = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNr);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export default function ProfileSetup() {
  const router = useRouter();
  const { t, setLocale, setExplanationLocale } = useLocale();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [level, setLevel] = useState<typeof LEVELS[number] | ''>('');
  const [goal, setGoal] = useState<number>(7.0);
  const [examDate, setExamDate] = useState('');

  // added from codex branch
  const [travelWeek, setTravelWeek] = useState('');
  const [festivalWeek, setFestivalWeek] = useState('');
  const [examWeek, setExamWeek] = useState('');

  const [prefs, setPrefs] = useState<string[]>([]);
  const [time, setTime] = useState<string>('');
  const [lang, setLang] = useState('en');
  const [explanationLang, setExplanationLang] = useState('en');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [ai, setAi] = useState<{suggestedGoal:number; etaWeeks:number; sequence:string[]} | null>(null);

  type FieldErrors = {
    goal?: string;
    examDate?: string;
    travelWeek?: string;
    festivalWeek?: string;
    examWeek?: string;
    avatarUrl?: string;
  };
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const clearFieldError = (field: keyof FieldErrors) =>
    setFieldErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });

  // Fetch active session & profile (draft-safe)
  useEffect(() => {
    (async () => {
      setLoading(true);
      if (typeof window !== 'undefined') {
        const url = window.location.href;
        if (url.includes('code=') || url.includes('access_token=')) {
          const { error } = await supabase.auth.exchangeCodeForSession(url);
          if (!error) router.replace('/profile/setup');
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/login');
        return;
      }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') setError(error.message); // not found is ok
      if (data) {
        setFullName(data.full_name ?? '');
        setCountry(data.country ?? '');
        setLevel((data.english_level as any) ?? '');
        setGoal(Number(data.goal_band ?? 7.0));
        setExamDate(data.exam_date ?? '');
        setPrefs((data.study_prefs as string[]) ?? []);
        setTime(data.time_commitment ?? '');

        const pl = data.preferred_language ?? 'en';
        setLang(pl);
        setLocale(pl);

        const el = data.explanation_language ?? 'en';
        setExplanationLang(el);
        setExplanationLocale(el);

        setAvatarUrl(data.avatar_url ?? undefined);
        try {
          const rec = data.ai_recommendation ?? {};
          if (rec.suggestedGoal) setAi(rec as any);
        } catch {}
      }

      // pull travel plans → prefill ISO weeks
      const { data: plans } = await supabase
        .from('travel_plans')
        .select('start_date,type')
        .eq('user_id', session.user.id);

      if (plans) {
        plans.forEach(p => {
          const w = dateToWeek(p.start_date as any);
          if (p.type === 'travel') setTravelWeek(w);
          else if (p.type === 'festival') setFestivalWeek(w);
          else if (p.type === 'exam') setExamWeek(w);
        });
      }

      setLoading(false);
    })();
  }, [router, setLocale, setExplanationLocale]);

  // Lightweight on-device AI heuristic (fallback).
  const localAISuggest = useMemo(() => {
    if (!level) return null;
    const base = { 'Beginner': 5.5, 'Elementary': 6.0, 'Pre-Intermediate': 6.5, 'Intermediate': 7.0, 'Upper-Intermediate': 7.5, 'Advanced': 8.0 } as const;
    const suggestedGoal = base[level];
    const focus = prefs.length ? prefs : ['Listening','Reading','Writing','Speaking'];
    const etaWeeks = Math.max(4, Math.round((suggestedGoal - 5) * 6)); // rough ETA
    return { suggestedGoal, etaWeeks, sequence: focus };
  }, [level, prefs]);

  useEffect(() => { setAi(localAISuggest); }, [localAISuggest]);

  const togglePref = (p: string) => {
    setPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const canSubmit = fullName && level && time && country && Object.keys(fieldErrors).length === 0;

  const saveProfile = async (finalize=false) => {
    if (!userId) return;
    setSaving(true);
    setError(null); setNotice(null);

    const errs: FieldErrors = {};
    if (goal < 4 || goal > 9 || Math.round(goal * 2) !== goal * 2) {
      errs.goal = 'Goal must be between 4.0 and 9.0 in 0.5 increments';
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (examDate) {
      if (!dateRegex.test(examDate)) errs.examDate = 'Invalid date format';
      else {
        const d = new Date(examDate);
        if (isNaN(d.getTime()) || d < today) errs.examDate = 'Exam date cannot be in the past';
      }
    }
    const weekRegex = /^\d{4}-W\d{2}$/;
    const checkWeek = (value: string, key: keyof FieldErrors) => {
      if (value) {
        if (!weekRegex.test(value)) errs[key] = 'Invalid week format';
        else {
          const range = getWeekRange(value);
          if (!range || range.start < today) errs[key] = 'Week cannot be in the past';
        }
      }
    };
    checkWeek(travelWeek, 'travelWeek');
    checkWeek(festivalWeek, 'festivalWeek');
    checkWeek(examWeek, 'examWeek');
    if (avatarUrl) {
      try {
        new URL(avatarUrl);
      } catch {
        errs.avatarUrl = 'Invalid URL';
      }
    }
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setSaving(false);
      return;
    }
    setFieldErrors({});

    const payload = {
      user_id: userId,
      full_name: fullName.trim(),
      country,
      english_level: level || null,
      goal_band: goal || null,
      exam_date: examDate || null,
      study_prefs: prefs,
      time_commitment: time || null,
      preferred_language: lang || 'en',
      explanation_language: explanationLang || 'en',
      avatar_url: avatarUrl || null,
      ai_recommendation: ai ? {
        suggestedGoal: ai.suggestedGoal,
        etaWeeks: ai.etaWeeks,
        sequence: ai.sequence
      } : {},
      draft: !finalize
    };

    // upsert profile
    const { data: existing } = await supabase.from('user_profiles').select('user_id').eq('user_id', userId).maybeSingle();
    const { error: upsertErr } = existing
      ? await supabase.from('user_profiles').update(payload).eq('user_id', userId)
      : await supabase.from('user_profiles').insert(payload);

    if (upsertErr) {
      setSaving(false);
      setError(upsertErr.message);
      return;
    }

    // sync travel_plans (replace all for this user)
    const plans: any[] = [];
    const addPlan = (w: string, type: 'travel'|'festival'|'exam') => {
      const r = getWeekRange(w);
      if (r) {
        plans.push({
          user_id: userId,
          type,
          start_date: r.start.toISOString().slice(0,10),
          end_date: r.end.toISOString().slice(0,10)
        });
      }
    };
    await supabase.from('travel_plans').delete().eq('user_id', userId);
    if (travelWeek) addPlan(travelWeek, 'travel');
    if (festivalWeek) addPlan(festivalWeek, 'festival');
    if (examWeek) addPlan(examWeek, 'exam');

    if (plans.length) {
      const { error: planErr } = await supabase.from('travel_plans').insert(plans);
      if (planErr) {
        setSaving(false);
        setError(planErr.message);
        return;
      }
    }

    setSaving(false);
    setNotice(finalize ? 'Profile saved — welcome aboard!' : 'Draft saved.');
    if (finalize) router.push('/dashboard');
  };

  return (
    <>
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <h1 className="font-slab text-display text-gradient-primary">{t('profileSetup.completeProfile')}</h1>
              <p className="text-grayish mt-2">{t('profileSetup.description')}</p>

              {error && <Alert variant="error" title="Unable to save">{error}</Alert>}
              {notice && <Alert variant="success" title={notice} />}

              <Card className="card-surface p-6 mt-6 rounded-ds-2xl">
                <div className="grid gap-5 md:grid-cols-2">
                  <Input label="Full name" placeholder="Your name" value={fullName} onChange={e=>setFullName(e.target.value)} required />
                  <Select label="Country" value={country} onChange={e=>setCountry(e.target.value)}>
                    <option value="" disabled>Select country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>

                  <Select label="English level" value={level} onChange={e=>setLevel(e.target.value as any)} hint="Self-assessed for now">
                    <option value="" disabled>Select level</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </Select>

                  <Select label="Time commitment" value={time} onChange={e=>setTime(e.target.value)}>
                    <option value="" disabled>Select time</option>
                    {TIME.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>

                  <div className="md:col-span-2">
                    <label className="block">
                      <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">Study preferences</span>
                      <div className="flex flex-wrap gap-2">
                        {PREFS.map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={()=>togglePref(p)}
                            aria-pressed={prefs.includes(p)}
                            className="focus:outline-none"
                          >
                            <Badge
                              variant={prefs.includes(p) ? 'success' : 'neutral'}
                              className={`cursor-pointer transition ${prefs.includes(p) ? 'ring-2 ring-success' : 'hover:opacity-90'}`}
                            >
                              {p}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block">
                      <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">
                        Goal band <span className="opacity-70">(4.0–9.0)</span>
                      </span>
                      <div className="flex items-center gap-4">
                        <input
                          type="range" min={4} max={9} step={0.5}
                          value={goal}
                          onChange={e=>{ setGoal(parseFloat(e.target.value)); clearFieldError('goal'); }}
                          className="w-full accent-primary"
                        />
                        <span className="text-body font-semibold">{goal.toFixed(1)}</span>
                      </div>
                    </label>
                    {fieldErrors.goal && <Alert variant="error" className="mt-2">{fieldErrors.goal}</Alert>}
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      type="date"
                      label="Exam date"
                      value={examDate}
                      onChange={e => { setExamDate(e.target.value); clearFieldError('examDate'); }}
                    />
                    {fieldErrors.examDate && <Alert variant="error" className="mt-2">{fieldErrors.examDate}</Alert>}
                  </div>

                  {/* Travel/festival/exam ISO week inputs */}
                  <div className="md:col-span-2">
                    <Input
                      type="week"
                      label="Travel week"
                      value={travelWeek}
                      onChange={e => { setTravelWeek(e.target.value); clearFieldError('travelWeek'); }}
                    />
                    {fieldErrors.travelWeek && <Alert variant="error" className="mt-2">{fieldErrors.travelWeek}</Alert>}
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      type="week"
                      label="Festival week"
                      value={festivalWeek}
                      onChange={e => { setFestivalWeek(e.target.value); clearFieldError('festivalWeek'); }}
                    />
                    {fieldErrors.festivalWeek && <Alert variant="error" className="mt-2">{fieldErrors.festivalWeek}</Alert>}
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      type="week"
                      label="Exam week"
                      value={examWeek}
                      onChange={e => { setExamWeek(e.target.value); clearFieldError('examWeek'); }}
                    />
                    {fieldErrors.examWeek && <Alert variant="error" className="mt-2">{fieldErrors.examWeek}</Alert>}
                  </div>

                  <Select
                    label={t('profileSetup.preferredLanguage')}
                    value={lang}
                    onChange={e => {
                      setLang(e.target.value);
                      setLocale(e.target.value);
                    }}
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                  </Select>

                  <Select
                    label={t('profileSetup.explanationLanguage')}
                    value={explanationLang}
                    onChange={e => {
                      setExplanationLang(e.target.value);
                      setExplanationLocale(e.target.value);
                    }}
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                  </Select>
                  <div>
                    <Input label="Avatar URL" placeholder="/path/to/avatar.png" value={avatarUrl ?? ''} onChange={e=>{ setAvatarUrl(e.target.value || undefined); clearFieldError('avatarUrl'); }} />
                    {fieldErrors.avatarUrl && <Alert variant="error" className="mt-2">{fieldErrors.avatarUrl}</Alert>}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={()=>saveProfile(false)} disabled={saving} variant="secondary" className="rounded-ds-xl">
                    {saving ? 'Saving…' : t('profileSetup.saveDraft')}
                  </Button>
                  <Button onClick={()=>saveProfile(true)} disabled={saving || !canSubmit} variant="primary" className="rounded-ds-xl">
                    {saving ? 'Saving…' : t('profileSetup.finishContinue')}
                  </Button>
                </div>
              </Card>
            </div>

            {/* AI Helper / Live Preview */}
            <aside className="space-y-4">
              <Card className="card-surface p-5 rounded-ds-2xl">
                <h3 className="font-slab text-h3 mb-2">AI study plan</h3>
                {ai ? (
                  <div className="space-y-2 text-body">
                    <div>Suggested goal: <span className="font-semibold text-electricBlue">{ai.suggestedGoal.toFixed(1)}</span></div>
                    <div>Estimated prep time: <span className="font-semibold">{ai.etaWeeks} weeks</span></div>
                    <div className="mt-2">
                      Focus sequence:
                      <div className="mt-2 flex flex-wrap gap-2">
                        {ai.sequence.map(s => <Badge key={s} variant="info" size="sm">{s}</Badge>)}
                      </div>
                    </div>
                    <Alert variant="info" className="mt-3">
                      This is a local suggestion. Connect server-side AI to refine it.
                    </Alert>
                  </div>
                ) : (
                  <p className="text-grayish">Pick your level and preferences to see recommendations.</p>
                )}
              </Card>

              <Card className="card-surface p-5 rounded-ds-2xl">
                <h3 className="font-slab text-h3 mb-2">Profile preview</h3>
                <div className="text-body">
                  <div className="font-semibold">{fullName || 'Your name'}</div>
                  <div className="opacity-80">{country || 'Country'} • {level || 'Level'} • {time || 'Time'}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {prefs.length ? prefs.map(p => <Badge key={p} size="sm">{p}</Badge>) : <span className="text-grayish">No preferences selected</span>}
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
