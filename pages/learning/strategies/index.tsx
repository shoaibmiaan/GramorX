// pages/learning/strategies/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/design-system/Input';
import { Alert } from '@/components/design-system/Alert';

type Area = 'all' | 'listening' | 'reading' | 'writing' | 'speaking';
type Difficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';

type StrategyTip = {
  id: string;
  slug: string;
  area: Exclude<Area, 'all'>;
  title: string;
  body: string;
  difficulty: Exclude<Difficulty, 'all'>;
  tags: string[];
  created_at: string;
};

type DrillResult = {
  prompt?: string;
  instructions?: string;
  passage?: string;
  choices?: string[];
  raw?: any; // for debugging if needed
};

// Normalize various payload shapes from /api/drills/generate
function normalizeDrill(payload: any): DrillResult {
  const src = payload?.data ?? payload ?? {};
  const prompt =
    src.prompt ||
    src.question ||
    src.task ||
    src.title ||
    (typeof src === 'string' ? src : '');
  const instructions =
    src.instructions ||
    src.hint ||
    src.howto ||
    (Array.isArray(src.steps) ? src.steps.join('\n') : undefined);
  const passage = src.passage || src.context || src.text;
  const choicesRaw = src.choices || src.options || src.answers;
  const choices = Array.isArray(choicesRaw)
    ? choicesRaw.map((c: any) => (typeof c === 'string' ? c : c?.text ?? JSON.stringify(c)))
    : undefined;
  return { prompt, instructions, passage, choices, raw: src };
}

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export default function Strategies() {
  const router = useRouter();

  // ---- filters
  const [area, setArea] = useState<Area>('all');
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  const [query, setQuery] = useState('');

  // ---- data & state
  const [tips, setTips] = useState<StrategyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // user state for toggles
  const [userId, setUserId] = useState<string | null>(null);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [helpfulSet, setHelpfulSet] = useState<Set<string>>(new Set());

  // drills
  const [drillLoading, setDrillLoading] = useState<Record<string, boolean>>({});
  const [drillResult, setDrillResult] = useState<Record<string, DrillResult | null>>({});

  // ---- read ?area=, ?level=, ?q= from URL on load/route change
  useEffect(() => {
    const a = (router.query.area as string) || 'all';
    const lvl = (router.query.level as string) || 'all';
    const q = (router.query.q as string) || '';
    const areas = ['listening','reading','writing','speaking','all'] as const;
    const levels = ['beginner','intermediate','advanced','all'] as const;
    if (areas.includes(a as any)) setArea(a as Area);
    if (levels.includes(lvl as any)) setDifficulty(lvl as Difficulty);
    if (typeof q === 'string') setQuery(q);
  }, [router.query.area, router.query.level, router.query.q]);

  // ---- sync filters to URL (shallow, shareable)
  useEffect(() => {
    const q: Record<string, string> = {};
    if (area !== 'all') q.area = area;
    if (difficulty !== 'all') q.level = difficulty;
    if (query.trim()) q.q = query.trim();
    router.replace({ pathname: router.pathname, query: q }, undefined, { shallow: true });
  }, [area, difficulty, query]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- fetch tips
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('strategies_tips')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (!cancelled) setTips((data ?? []) as StrategyTip[]);
      } catch (e: any) {
        if (!cancelled) setErr(e.message ?? 'Failed to load tips');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- fetch user & user-scoped saves/votes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabase();
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id ?? null;
      if (cancelled) return;
      setUserId(uid);

      if (!uid) {
        setSavedSet(new Set());
        setHelpfulSet(new Set());
        return;
      }
      const [{ data: saves }, { data: votes }] = await Promise.all([
        supabase.from('strategies_tip_saves').select('tip_id'),
        supabase.from('strategies_tip_votes').select('tip_id'),
      ]);
      if (cancelled) return;
      setSavedSet(new Set((saves ?? []).map((r: any) => r.tip_id)));
      setHelpfulSet(new Set((votes ?? []).map((r: any) => r.tip_id)));
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- filtering (client-side)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tips.filter((t) => {
      if (area !== 'all' && t.area !== area) return false;
      if (difficulty !== 'all' && t.difficulty !== difficulty) return false;
      if (!q) return true;
      const inTitle = t.title.toLowerCase().includes(q);
      const inBody = t.body.toLowerCase().includes(q);
      const inTags = (t.tags || []).some(tag => tag.toLowerCase().includes(q));
      return inTitle || inBody || inTags;
    });
  }, [tips, area, difficulty, query]);

  // ---- actions
  // Redirect to /login when signed out (PATCH A)
  const toggleSave = async (tipId: string) => {
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }
    const supabase = getSupabase();
    const next = new Set(savedSet);
    const isSaved = next.has(tipId);
    // optimistic
    isSaved ? next.delete(tipId) : next.add(tipId);
    setSavedSet(next);

    if (isSaved) {
      const { error } = await supabase
        .from('strategies_tip_saves')
        .delete()
        .eq('user_id', userId)
        .eq('tip_id', tipId);
      if (error) setSavedSet(prev => new Set([...prev, tipId])); // rollback
    } else {
      const { error } = await supabase
        .from('strategies_tip_saves')
        .insert({ user_id: userId, tip_id: tipId });
      if (error) {
        setSavedSet(prev => { const s = new Set(prev); s.delete(tipId); return s; });
      }
    }
  };

  const toggleHelpful = async (tipId: string) => {
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }
    const supabase = getSupabase();
    const next = new Set(helpfulSet);
    const isHelpful = next.has(tipId);
    // optimistic
    isHelpful ? next.delete(tipId) : next.add(tipId);
    setHelpfulSet(next);

    if (isHelpful) {
      const { error } = await supabase
        .from('strategies_tip_votes')
        .delete()
        .eq('user_id', userId)
        .eq('tip_id', tipId);
      if (error) setHelpfulSet(prev => new Set([...prev, tipId])); // rollback
    } else {
      const { error } = await supabase
        .from('strategies_tip_votes')
        .insert({ user_id: userId, tip_id: tipId, helpful: true });
      if (error) {
        setHelpfulSet(prev => { const s = new Set(prev); s.delete(tipId); return s; });
      }
    }
  };

  const tryNow = async (tip: StrategyTip) => {
    setDrillLoading(prev => ({ ...prev, [tip.id]: true }));
    setDrillResult(prev => ({ ...prev, [tip.id]: null }));
    try {
      const res = await fetch('/api/drills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // send both common keys to be safe
          skill: tip.area,
          area: tip.area,
          level: tip.difficulty,
          difficulty: tip.difficulty,
          tipSlug: tip.slug,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate drill');
      const data = await res.json();
      const normalized = normalizeDrill(data);
      setDrillResult(prev => ({ ...prev, [tip.id]: normalized }));
    } catch (e) {
      setDrillResult(prev => ({
        ...prev,
        [tip.id]: { prompt: 'Error: unable to generate drill. Please try again.' },
      }));
    } finally {
      setDrillLoading(prev => ({ ...prev, [tip.id]: false }));
    }
  };

  // ---- UI helpers
  const AreaBadge = ({ a }: { a: StrategyTip['area'] }) => (
    <Badge variant="info" size="sm" className="whitespace-nowrap capitalize">{a}</Badge>
  );
  const DiffBadge = ({ d }: { d: StrategyTip['difficulty'] }) => (
    <Badge variant="neutral" size="sm" className="whitespace-nowrap capitalize">{d}</Badge>
  );

  const excerpt = (s: string, n = 140) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl text-gradient-primary">IELTS Strategy Tips</h1>
        <p className="text-grayish max-w-2xl">Filter by skill & difficulty, search by keywords, then launch a quick AI micro-drill.</p>

        {/* Filters Card */}
        <Card className="card-surface p-6 rounded-ds-2xl mt-8">
          {/* Skill filter */}
          <div className="flex flex-wrap gap-2 items-center">
            {(['all','listening','reading','writing','speaking'] as Area[]).map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={area === a}
                onClick={() => setArea(a)}
                className="focus:outline-none"
                title={`Filter by ${a}`}
              >
                <Badge variant={area === a ? 'success' : 'neutral'} size="md" className="capitalize">
                  {a}
                </Badge>
              </button>
            ))}
          </div>

          {/* Difficulty + Search */}
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-2">
              {(['all','beginner','intermediate','advanced'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={difficulty === d}
                  onClick={() => setDifficulty(d)}
                  className="focus:outline-none"
                  title={`Difficulty: ${d}`}
                >
                  <Badge variant={difficulty === d ? 'success' : 'neutral'} size="md" className="capitalize">
                    {d}
                  </Badge>
                </button>
              ))}
            </div>
            <div className="md:ml-auto md:w-80">
              {/* Labeled Input per DS (PATCH D) */}
              <Input
                label="Search"
                placeholder="Title, body, or tags…"
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
            </div>
          </div>
        </Card>

        {/* States */}
        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded mb-3" />
                <div className="animate-pulse h-4 w-24 bg-gray-200 dark:bg-white/10 rounded mb-1.5" />
                <div className="animate-pulse h-4 w-20 bg-gray-200 dark:bg-white/10 rounded mb-4" />
                <div className="animate-pulse h-4 w-full bg-gray-200 dark:bg-white/10 rounded" />
              </Card>
            ))}
          </div>
        )}

        {!loading && err && (
          <div className="mt-10">
            <Alert variant="error" title="Couldn’t load tips">
              {err} <br />
              <Button variant="secondary" className="mt-3" onClick={() => router.replace(router.asPath)}>Retry</Button>
            </Alert>
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <Card className="p-6 mt-10">
            <p className="text-grayish">No tips match your filters.</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => { setArea('all'); setDifficulty('all'); setQuery(''); }}>
                Reset filters
              </Button>
            </div>
          </Card>
        )}

        {/* Tips grid */}
        {!loading && !err && filtered.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <Card key={t.id} className="card-surface p-6 rounded-ds-2xl flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-h3">{t.title}</h3>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <AreaBadge a={t.area} />
                  <DiffBadge d={t.difficulty} />
                  {(t.tags ?? []).slice(0, 4).map(tag => (
                    <Badge key={tag} variant="info" size="sm" className="capitalize">{tag}</Badge>
                  ))}
                </div>

                <p className="mt-3 text-body opacity-90">{excerpt(t.body)}</p>

                <div className="mt-5 flex flex-wrap gap-2 items-center">
                  {/* Disable while loading + aria-busy (PATCH B) */}
                  <Button
                    variant="primary"
                    onClick={() => tryNow(t)}
                    disabled={!!drillLoading[t.id]}
                    aria-label={`Try drill for ${t.title}`}
                    aria-busy={!!drillLoading[t.id]}
                  >
                    {drillLoading[t.id] ? 'Generating…' : 'Try this now'}
                  </Button>

                  {/* View detail now navigates to SEO page */}
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/learning/strategies/${t.slug}`)}
                    aria-label={`View details for ${t.title}`}
                  >
                    View detail
                  </Button>

                  <div className="ml-auto flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => toggleSave(t.id)}
                      aria-pressed={savedSet.has(t.id)}
                      aria-label={savedSet.has(t.id) ? 'Unsave tip' : 'Save tip'}
                      className={savedSet.has(t.id) ? 'ring-2 ring-success' : ''}
                    >
                      {savedSet.has(t.id) ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => toggleHelpful(t.id)}
                      aria-pressed={helpfulSet.has(t.id)}
                      aria-label={helpfulSet.has(t.id) ? 'Remove helpful vote' : 'Mark helpful'}
                      className={helpfulSet.has(t.id) ? 'ring-2 ring-electricBlue' : ''}
                    >
                      {helpfulSet.has(t.id) ? 'Helpful ✓' : 'Helpful'}
                    </Button>
                  </div>
                </div>

                {/* Inline drill result */}
                {drillLoading[t.id] && (
                  <div className="mt-4">
                    <Alert title="Generating…" variant="info">Building a quick micro-drill for this tip.</Alert>
                  </div>
                )}
                {!drillLoading[t.id] && drillResult[t.id] && (
                  <Card className="p-4 mt-4">
                    <h4 className="font-semibold mb-2">Drill</h4>
                    {drillResult[t.id]?.prompt && (
                      <p className="whitespace-pre-wrap">{drillResult[t.id]!.prompt}</p>
                    )}
                    {drillResult[t.id]?.passage && (
                      <p className="mt-2 whitespace-pre-wrap opacity-90">{drillResult[t.id]!.passage}</p>
                    )}
                    {drillResult[t.id]?.instructions && (
                      <p className="mt-2 opacity-90 text-small">{drillResult[t.id]!.instructions}</p>
                    )}
                    {Array.isArray(drillResult[t.id]?.choices) && drillResult[t.id]!.choices!.length > 0 && (
                      <ul className="mt-3 list-disc pl-5">
                        {drillResult[t.id]!.choices!.map((c, i) => (
                          <li key={i} className="text-body">{c}</li>
                        ))}
                      </ul>
                    )}
                  </Card>
                )}
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
