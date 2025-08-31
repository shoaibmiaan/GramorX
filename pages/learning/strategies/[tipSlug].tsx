import { env } from "@/lib/env";
// pages/learning/strategies/[tipSlug].tsx
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '@/utils/logger';

import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';

type Area = 'listening' | 'reading' | 'writing' | 'speaking';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

type StrategyTip = {
  id: string;
  slug: string;
  area: Area;
  title: string;
  body: string;
  difficulty: Difficulty;
  tags: string[];
  created_at: string;
};

  type DrillResult = {
    prompt?: string;
    instructions?: string;
    passage?: string;
    choices?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw?: any;
  };

  // Normalize various payload shapes from /api/drills/generate (same as list page)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        choicesRaw.map((c: any) => (typeof c === 'string' ? c : c?.text ?? JSON.stringify(c)))
      : undefined;
  return { prompt, instructions, passage, choices, raw: src };
}

function getClient(): SupabaseClient {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default function TipDetail({
  tip,
  related,
}: {
  tip: StrategyTip | null;
  related: StrategyTip[];
}) {
  const router = useRouter();
  const DEBUG =
    env.NEXT_PUBLIC_DEBUG === '1' || (router.query.debug as string) === '1';

  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const [loadingToggles, setLoadingToggles] = useState(false);

  const [drillLoading, setDrillLoading] = useState(false);
  const [drill, setDrill] = useState<DrillResult | null>(null);

  // client auth state + existing save/vote
  useEffect(() => {
    if (!tip) return;
    let cancel = false;
    (async () => {
      const supabase = getClient();
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id ?? null;
      if (cancel) return;
      setUserId(uid);

      if (!uid) {
        setSaved(false);
        setHelpful(false);
        return;
      }
      const [{ data: s }, { data: v }] = await Promise.all([
        supabase.from('strategies_tip_saves').select('tip_id').eq('tip_id', tip.id).maybeSingle(),
        supabase.from('strategies_tip_votes').select('tip_id').eq('tip_id', tip.id).maybeSingle(),
      ]);
      if (cancel) return;
      setSaved(!!s);
      setHelpful(!!v);
    })();
    return () => {
      cancel = true;
    };
  }, [tip]);

  // Not found
  if (!tip) {
    return (
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <Card className="p-6">
            <h1 className="text-h3 font-semibold mb-2">Tip not found</h1>
            <p className="text-body text-grayish">This strategy may have been moved or removed.</p>
            <div className="mt-4">
              <Button as="a" href="/learning/strategies" variant="primary">
                Back to strategies
              </Button>
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  const AreaBadge = ({ a }: { a: Area }) => (
    <Badge variant="info" size="sm" className="capitalize">{a}</Badge>
  );
  const DiffBadge = ({ d }: { d: Difficulty }) => (
    <Badge variant="neutral" size="sm" className="capitalize">{d}</Badge>
  );

  const tryDrill = async () => {
    setDrillLoading(true);
    setDrill(null);
    try {
      const res = await fetch('/api/drills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: tip.area, area: tip.area,
          level: tip.difficulty, difficulty: tip.difficulty,
          tipSlug: tip.slug,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate drill');
      const data = await res.json();
      const normalized = normalizeDrill(data);

      if (DEBUG) {
        logger.debug(
          `[drill/detail] ${tip.slug} (${tip.area}/${tip.difficulty}) request`,
          { skill: tip.area, level: tip.difficulty, tipSlug: tip.slug }
        );
        logger.debug(
          `[drill/detail] ${tip.slug} (${tip.area}/${tip.difficulty}) response`,
          data
        );
        logger.debug(
          `[drill/detail] ${tip.slug} (${tip.area}/${tip.difficulty}) normalized`,
          normalized
        );
      }

      setDrill(normalized);
    } catch {
      setDrill({ prompt: 'Error: unable to generate drill. Please try again.' });
    } finally {
      setDrillLoading(false);
    }
  };

  const requireLogin = () => {
    window.location.href = `/login?next=${encodeURIComponent(`/learning/strategies/${tip.slug}`)}`;
  };

  const toggleSave = async () => {
    if (!userId) return requireLogin();
    setLoadingToggles(true);
    const supabase = getClient();
    const optimistic = !saved;
    setSaved(optimistic);
    try {
      if (optimistic) {
        const { error } = await supabase.from('strategies_tip_saves').insert({ user_id: userId, tip_id: tip.id });
        if (error) setSaved(!optimistic);
      } else {
        const { error } = await supabase
          .from('strategies_tip_saves')
          .delete()
          .eq('user_id', userId)
          .eq('tip_id', tip.id);
        if (error) setSaved(!optimistic);
      }
    } finally {
      setLoadingToggles(false);
    }
  };

  const toggleHelpful = async () => {
    if (!userId) return requireLogin();
    setLoadingToggles(true);
    const supabase = getClient();
    const optimistic = !helpful;
    setHelpful(optimistic);
    try {
      if (optimistic) {
        const { error } = await supabase.from('strategies_tip_votes').insert({ user_id: userId, tip_id: tip.id, helpful: true });
        if (error) setHelpful(!optimistic);
      } else {
        const { error } = await supabase
          .from('strategies_tip_votes')
          .delete()
          .eq('user_id', userId)
          .eq('tip_id', tip.id);
        if (error) setHelpful(!optimistic);
      }
    } finally {
      setLoadingToggles(false);
    }
  };

  return (
    <>
      <Head>
        <title>{tip.title} — IELTS Strategy Tips</title>
        <meta name="description" content={`${tip.title} — ${tip.area} (${tip.difficulty}).`} />
        <link rel="canonical" href={`/learning/strategies/${tip.slug}`} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: tip.title,
              about: tip.tags,
              datePublished: tip.created_at,
              author: 'GramorX',
            }),
          }}
        />
      </Head>

      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-slab text-4xl text-gradient-primary">{tip.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <AreaBadge a={tip.area} />
                <DiffBadge d={tip.difficulty} />
                {(tip.tags || []).map((t) => (
                  <Badge key={t} variant="info" size="sm" className="capitalize">{t}</Badge>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <Button as="a" href={`/learning/strategies?area=${tip.area}`} variant="secondary">
                Back
              </Button>
            </div>
          </div>

          <Card className="card-surface p-6 rounded-ds-2xl mt-8">
            <p className="text-body whitespace-pre-wrap">{tip.body}</p>

            <div className="mt-6 flex flex-wrap gap-2 items-center">
              <Button
                variant="primary"
                onClick={tryDrill}
                disabled={drillLoading}
                aria-busy={drillLoading}
              >
                {drillLoading ? 'Generating…' : 'Try this now'}
              </Button>

              <div className="ml-auto flex gap-2">
                <Button
                  variant="secondary"
                  onClick={toggleSave}
                  disabled={loadingToggles}
                  aria-pressed={saved}
                  className={saved ? 'ring-2 ring-success' : ''}
                >
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={toggleHelpful}
                  disabled={loadingToggles}
                  aria-pressed={helpful}
                  className={helpful ? 'ring-2 ring-electricBlue' : ''}
                >
                  {helpful ? 'Helpful ✓' : 'Helpful'}
                </Button>
              </div>
            </div>

            {drillLoading && (
              <div className="mt-4">
                <Alert title="Generating…" variant="info">Building a quick micro-drill for this tip.</Alert>
              </div>
            )}
            {!drillLoading && drill && (
              <Card className="p-4 mt-4">
                <h4 className="font-semibold mb-2">Drill</h4>
                {drill.prompt && <p className="whitespace-pre-wrap">{drill.prompt}</p>}
                {drill.passage && (
                  <p className="mt-2 whitespace-pre-wrap opacity-90">{drill.passage}</p>
                )}
                {drill.instructions && (
                  <p className="mt-2 opacity-90 text-small">{drill.instructions}</p>
                )}
                {Array.isArray(drill.choices) && drill.choices.length > 0 && (
                  <ul className="mt-3 list-disc pl-5">
                    {drill.choices.map((c, i) => (
                      <li key={i} className="text-body">{c}</li>
                    ))}
                  </ul>
                )}
                {DEBUG && drill.raw && (
                  <details className="mt-3">
                    <summary className="cursor-pointer opacity-70 text-small">Debug payload</summary>
                    <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(drill.raw, null, 2)}</pre>
                  </details>
                )}
              </Card>
            )}
          </Card>

          {related?.length > 0 && (
            <div className="mt-10">
              <h2 className="text-h3 font-semibold mb-4">More in {tip.area}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Card key={r.id} className="p-5">
                    <h3 className="font-semibold text-lg mb-2">{r.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <DiffBadge d={r.difficulty} />
                      {(r.tags || []).slice(0, 3).map((t) => (
                        <Badge key={t} variant="info" size="sm" className="capitalize">{t}</Badge>
                      ))}
                    </div>
                    <Button as="a" href={`/learning/strategies/${r.slug}`} variant="secondary">
                      Open
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const slug = String(ctx.params?.tipSlug || '');
  const { data: tip } = await supabase
    .from('strategies_tips')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!tip) {
    return { props: { tip: null, related: [] } };
  }

  const { data: related } = await supabase
    .from('strategies_tips')
    .select('id, slug, area, title, difficulty, tags, created_at')
    .eq('area', tip.area)
    .neq('id', tip.id)
    .order('created_at', { ascending: false })
    .limit(6);

  return { props: { tip, related: related ?? [] } };
};
