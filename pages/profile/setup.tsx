import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useLocale } from '@/lib/locale/index';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { AvatarUploader } from '@/components/design-system/AvatarUploader';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import Image from "next/image";
import { Alert } from '@/components/design-system/Alert';
import { Select } from '@/components/design-system/Select';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { COUNTRIES, LEVELS, TIME, PREFS, WEAKNESSES } from '@/lib/profile-options';

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

/** ——— UI helpers ——— */
const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean }>
= ({ title, subtitle, children, defaultOpen = true }) => (
  <details open={defaultOpen} className="group rounded-ds-2xl border border-border/50 bg-card/60 backdrop-blur-[2px] shadow-sm">
    <summary className="cursor-pointer select-none list-none px-5 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="font-slab text-h4 m-0">{title}</h2>
        {subtitle && <p className="text-muted -mt-0.5 text-small">{subtitle}</p>}
      </div>
      <span className="ml-auto shrink-0 rounded-full border px-2 py-0.5 text-xs text-muted group-open:rotate-180 transition-transform">⌄</span>
    </summary>
    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">{children}</div>
  </details>
);

const ProgressBar: React.FC<{ value: number }>= ({ value }) => (
  <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
    <div className="h-full w-[--w] bg-gradient-to-r from-primary/80 to-electricBlue/80 transition-[width] duration-300" style={{
      width: `${Math.min(100, Math.max(0, value))}%`,
      // @ts-ignore
      ['--w' as any]: `${Math.min(100, Math.max(0, value))}%`
    }}/>
  </div>
);

const SkeletonLine: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className ?? 'h-4 w-full'}`} />
);

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
  const [goal, setGoal] = useState(7.0);
  const [examDate, setExamDate] = useState('');

  // added from codex branch
  const [travelWeek, setTravelWeek] = useState('');
  const [festivalWeek, setFestivalWeek] = useState('');
  const [examWeek, setExamWeek] = useState('');

  const [prefs, setPrefs] = useState<typeof PREFS[number][]>([]);
  const [time, setTime] = useState<typeof TIME[number] | ''>('');
  const [lang, setLang] = useState('en');
  const [explanationLang, setExplanationLang] = useState('en');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [ai, setAi] = useState<{suggestedGoal:number; etaWeeks:number; sequence:string[]} | null>(null);

  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneStage, setPhoneStage] = useState<'request' | 'verify' | 'verified'>('request');
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const [weaknesses, setWeaknesses] = useState<typeof WEAKNESSES[number][]>([]);
  const [timezone, setTimezone] = useState('');
  const timezones = useMemo(() => {
    try {
      return (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') : [];
    } catch {
      return [] as string[];
    }
  }, []);

  useEffect(() => {
    if (!timezone) {
      try { setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch {}
    }
  }, [timezone]);

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
        setPhone(data.phone ?? '');
        setPhoneStage(data.phone ? 'verified' : 'request');
        setWeaknesses((data.weaknesses as string[]) ?? []);
        setTimezone(data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);

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
    const focus = prefs.length ? prefs : [...PREFS];
    const etaWeeks = Math.max(4, Math.round((suggestedGoal - 5) * 6)); // rough ETA
    return { suggestedGoal, etaWeeks, sequence: focus };
  }, [level, prefs]);

  useEffect(() => { setAi(localAISuggest); }, [localAISuggest]);

  const togglePref = (p: typeof PREFS[number]) => {
    setPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const toggleWeakness = (w: typeof WEAKNESSES[number]) => {
    setWeaknesses(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  };

  const requestOtp = async () => {
    setPhoneErr(null);
    if (!phone) {
      setPhoneErr('Enter phone number');
      return;
    }
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      setPhoneStage('verify');
    } catch (e: any) {
      setPhoneErr(e.message);
    }
  };

  const verifyOtp = async () => {
    setPhoneErr(null);
    if (!phoneCode) {
      setPhoneErr('Enter code');
      return;
    }
    try {
      const res = await fetch('/api/check-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: phoneCode })
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      setPhoneStage('verified');
    } catch (e: any) {
      setPhoneErr(e.message);
    }
  };

  const canSubmit = fullName && level && time && country && phoneStage === 'verified' && Object.keys(fieldErrors).length === 0;

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
      phone: phone || null,
      weaknesses,
      timezone: timezone || null,
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

  // ——— Progress (for top bar + CTA button states) ———
  const requiredCount = 5; // fullName, country, level, time, phone verified
  const filled = [Boolean(fullName), Boolean(country), Boolean(level), Boolean(time), phoneStage === 'verified'].filter(Boolean).length;
  const progress = Math.round((filled / requiredCount) * 100);

  return (
    <section className="pb-24 sm:pb-14 pt-10 sm:pt-16 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        {/* Header + progress */}
        <div className="mx-auto mb-6 sm:mb-8 max-w-5xl">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <h1 className="font-slab text-display leading-tight text-gradient-primary">{t('profileSetup.completeProfile')}</h1>
              <p className="text-muted mt-1 sm:mt-2 max-w-prose">{t('profileSetup.description')}</p>
            </div>
            <div className="w-full sm:w-64">
              <ProgressBar value={progress} />
              <p className="mt-1 text-right text-xs text-muted">{progress}%</p>
            </div>
          </div>
          {/* live regions for a11y */}
          <div aria-live="assertive" className="sr-only">{error ? `Error: ${error}` : ''}</div>
          <div aria-live="polite" className="sr-only">{notice ? `Notice: ${notice}` : ''}</div>
          {error && <Alert variant="error" title="Unable to save" className="mt-3">{error}</Alert>}
          {notice && <Alert variant="success" title={notice} className="mt-3" />}
        </div>

        <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="space-y-4">
            {loading ? (
              <Card className="card-surface p-6 rounded-ds-2xl space-y-4">
                <SkeletonLine className="h-6 w-2/3" />
                <SkeletonLine className="h-5 w-1/3" />
                <div className="grid sm:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <SkeletonLine className="h-3 w-24" />
                      <SkeletonLine className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <>
                {/* Basics */}
                <Section title="Basics" subtitle="Tell us who you are">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input label="Full name" placeholder="Your name" value={fullName} onChange={e=>setFullName(e.target.value)} required aria-invalid={!fullName || undefined} />
                    <Select label="Country" value={country} onChange={e=>setCountry(e.target.value)} aria-invalid={!country || undefined}>
                      <option value="" disabled>Select country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </div>
                </Section>

                {/* Learning */}
                <Section title="Learning" subtitle="Level & commitment">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select label="English level" value={level} onChange={e=>setLevel(e.target.value as any)} hint="Self-assessed for now" aria-invalid={!level || undefined}>
                      <option value="" disabled>Select level</option>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </Select>
                    <Select label="Time commitment" value={time} onChange={e=>setTime(e.target.value)} aria-invalid={!time || undefined}>
                      <option value="" disabled>Select time</option>
                      {TIME.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </div>
                </Section>

                {/* Contact & Language */}
                <Section title="Contact & Languages" subtitle="Phone verification and app language">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Input label="Phone number" type="tel" placeholder="+1234567890" value={phone} onChange={e=>setPhone(e.target.value)} aria-describedby={phoneErr ? 'phone-error' : undefined} />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {phoneStage === 'request' && (
                          <Button type="button" variant="secondary" className="rounded-ds-xl" onClick={requestOtp}>Send code</Button>
                        )}
                        {phoneStage === 'verify' && (
                          <>
                            <Input aria-label="Verification code" placeholder="123456" value={phoneCode} onChange={e=>setPhoneCode(e.target.value)} className="w-40" />
                            <Button type="button" variant="secondary" className="rounded-ds-xl" onClick={verifyOtp}>Verify</Button>
                          </>
                        )}
                        {phoneStage === 'verified' && <Badge variant="success" className="mt-1">Verified</Badge>}
                      </div>
                      {phoneErr && <Alert id="phone-error" variant="error" className="mt-2">{phoneErr}</Alert>}
                    </div>

                    <Select label={t('profileSetup.preferredLanguage')} value={lang} onChange={e => { setLang(e.target.value); setLocale(e.target.value); }}>
                      <option value="en">English</option>
                      <option value="ur">Urdu</option>
                      <option value="ar">Arabic</option>
                      <option value="hi">Hindi</option>
                    </Select>
                    <Select label={t('profileSetup.explanationLanguage')} value={explanationLang} onChange={e => { setExplanationLang(e.target.value); setExplanationLocale(e.target.value); }}>
                      <option value="en">English</option>
                      <option value="ur">Urdu</option>
                      <option value="ar">Arabic</option>
                      <option value="hi">Hindi</option>
                    </Select>

                    <div className="sm:col-span-2">
                      <AvatarUploader
                        userId={userId}
                        initialUrl={avatarUrl}
                        onUploaded={async (url) => {
                          setAvatarUrl(url);
                          clearFieldError('avatarUrl');
                          await supabase.auth.updateUser({ data: { avatar_url: url } });
                        }}
                      />
                    </div>
                  </div>
                </Section>

                {/* Targets */}
                <Section title="Targets" subtitle="Your goal & key dates">
                  <div className="space-y-6">
                    <div>
                      <label className="block">
                        <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">Goal band <span className="opacity-70">(4.0–9.0)</span></span>
                        <div className="flex items-center gap-4">
                          <input type="range" min={4} max={9} step={0.5} value={goal} onChange={e=>{ setGoal(parseFloat(e.target.value)); clearFieldError('goal'); }} className="w-full accent-primary" />
                          <span className="text-body font-semibold tabular-nums">{goal.toFixed(1)}</span>
                        </div>
                      </label>
                      {fieldErrors.goal && <Alert variant="error" className="mt-2">{fieldErrors.goal}</Alert>}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input type="date" label="Exam date" value={examDate} onChange={e => { setExamDate(e.target.value); clearFieldError('examDate'); }} />
                      <Select label="Timezone" value={timezone} onChange={e=>setTimezone(e.target.value)}>
                        {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                      </Select>
                    </div>
                    {fieldErrors.examDate && <Alert variant="error">{fieldErrors.examDate}</Alert>}

                    <div className="grid gap-5 sm:grid-cols-3">
                      <Input type="week" label="Travel week" value={travelWeek} onChange={e => { setTravelWeek(e.target.value); clearFieldError('travelWeek'); }} />
                      <Input type="week" label="Festival week" value={festivalWeek} onChange={e => { setFestivalWeek(e.target.value); clearFieldError('festivalWeek'); }} />
                      <Input type="week" label="Exam week" value={examWeek} onChange={e => { setExamWeek(e.target.value); clearFieldError('examWeek'); }} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {fieldErrors.travelWeek && <Alert variant="error">{fieldErrors.travelWeek}</Alert>}
                      {fieldErrors.festivalWeek && <Alert variant="error">{fieldErrors.festivalWeek}</Alert>}
                      {fieldErrors.examWeek && <Alert variant="error">{fieldErrors.examWeek}</Alert>}
                    </div>
                  </div>
                </Section>

                {/* Preferences */}
                <Section title="Study preferences" subtitle="Tune your plan" defaultOpen={false}>
                  <div className="grid gap-6">
                    <div>
                      <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">Focus areas</span>
                      <div className="flex flex-wrap gap-2">
                        {PREFS.map(p => (
                          <button key={p} type="button" onClick={()=>togglePref(p)} aria-pressed={prefs.includes(p)} className="focus-visible:outline-none">
                            <Badge variant={prefs.includes(p) ? 'success' : 'neutral'} className={`cursor-pointer transition ${prefs.includes(p) ? 'ring-2 ring-success' : 'hover:opacity-90'}`}>{p}</Badge>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">Weak areas</span>
                      <div className="flex flex-wrap gap-2">
                        {WEAKNESSES.map(w => (
                          <button key={w} type="button" onClick={()=>toggleWeakness(w)} aria-pressed={weaknesses.includes(w)} className="focus-visible:outline-none">
                            <Badge variant={weaknesses.includes(w) ? 'warning' : 'neutral'} className={`cursor-pointer transition ${weaknesses.includes(w) ? 'ring-2 ring-warning' : 'hover:opacity-90'}`}>{w}</Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Desktop actions */}
                <Card className="hidden sm:flex card-surface p-4 sm:p-5 rounded-ds-2xl items-center justify-end gap-3">
                  <Button onClick={()=>saveProfile(false)} disabled={saving} variant="secondary" className="rounded-ds-xl">
                    {saving ? 'Saving…' : t('profileSetup.saveDraft')}
                  </Button>
                  <Button onClick={()=>saveProfile(true)} disabled={saving || !canSubmit} variant="primary" className="rounded-ds-xl">
                    {saving ? 'Saving…' : t('profileSetup.finishContinue')}
                  </Button>
                </Card>
              </>
            )}
          </div>

          {/* AI Helper / Live Preview */}
          <aside className="space-y-4 lg:sticky lg:top-6 self-start">
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
                  <Alert variant="info" className="mt-3">This is a local suggestion. Connect server-side AI to refine it.</Alert>
                </div>
              ) : (
                <p className="text-grayish">Pick your level and preferences to see recommendations.</p>
              )}
            </Card>

            <Card className="card-surface p-5 rounded-ds-2xl">
              <h3 className="font-slab text-h3 mb-2">Profile preview</h3>
              <div className="text-body">
                {avatarUrl && (
                  <Image src={avatarUrl} alt="Avatar preview" width={80} height={80} className="mb-3 h-20 w-20 rounded-full object-cover ring-2 ring-primary/40" />                )}
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

      {/* Sticky mobile action bar */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-[rgb(var(--card))]/95 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--card))]/75">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-2">
          <Button onClick={()=>saveProfile(false)} disabled={saving} variant="secondary" className="flex-1 rounded-ds-xl">
            {saving ? 'Saving…' : t('profileSetup.saveDraft')}
          </Button>
          <Button onClick={()=>saveProfile(true)} disabled={saving || !canSubmit} variant="primary" className="flex-1 rounded-ds-xl">
            {saving ? 'Saving…' : t('profileSetup.finishContinue')}
          </Button>
        </div>
      </div>
    </section>
  );
}
