// pages/welcome/index.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Container } from '@/components/design-system/Container';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { StreakIndicator } from '@/components/design-system/StreakIndicator';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { getUserRole } from '@/lib/routeAccess';
import { useLocale } from '@/lib/locale';

type WordOfDay = { word: string; meaning?: string; example?: string };

const ModuleCard: React.FC<{ title: string; href: string; caption: string; chip?: string }> = ({
  title, href, caption, chip,
}) => (
  <Link href={href} className="block focus:outline-none group">
    <div className="card-surface rounded-ds-2xl border border-border bg-card text-card-foreground p-5 transition
                    hover:shadow-glow hover:-translate-y-0.5 focus:ring-2 focus:ring-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {chip ? <Badge variant="info">{chip}</Badge> : null}
      </div>
      <p className="text-sm text-mutedText">{caption}</p>
      <div className="mt-4"><Button variant="secondary" className="rounded-ds-xl">Open</Button></div>
    </div>
  </Link>
);

// --- helpers ---------------------------------------------------------------

function normalizeWod(raw: any): WordOfDay {
  // Handle shapes like:
  // { word: "serendipity", meaning, example }
  // { word: { id, word, meaning, example } }
  // { data: { word: "serendipity", meaning, example } }
  // { data: { word: { id, word, meaning, example } } }
  // [ { word, meaning, example }, ... ]
  let obj: any = raw;

  if (Array.isArray(raw)) obj = raw[0];
  if (raw?.data) obj = raw.data;
  if (Array.isArray(obj)) obj = obj[0];

  let w: string | undefined;
  let m: string | undefined;
  let e: string | undefined;

  if (typeof obj === 'string') {
    w = obj;
  } else if (obj && typeof obj === 'object') {
    if (typeof obj.word === 'string') {
      w = obj.word;
      m = typeof obj.meaning === 'string' ? obj.meaning : undefined;
      e = typeof obj.example === 'string' ? obj.example : undefined;
    } else if (obj.word && typeof obj.word === 'object') {
      w = typeof obj.word.word === 'string' ? obj.word.word : undefined;
      m = typeof obj.word.meaning === 'string' ? obj.word.meaning : undefined;
      e = typeof obj.word.example === 'string' ? obj.word.example : undefined;
    }
  }

  return {
    word: w ?? 'Serendipity',
    meaning: m ?? 'A fortunate discovery by chance.',
    example: e ?? 'I met my mentor by pure serendipity.',
  };
}

// --------------------------------------------------------------------------

export default function WelcomePage() {
  const router = useRouter();
  const { t } = useLocale();

  const [name, setName] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [wod, setWod] = useState<WordOfDay | null>(null);
  const [loadingWord, setLoadingWord] = useState(true);

  // Redirect non-students away from /welcome
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const role = getUserRole(session?.user);
      if (role === 'teacher') { router.replace('/teacher'); return; }
      if (role === 'admin')   { router.replace('/admin');   return; }
    })();
  }, [router]);

  // Pull minimal profile info
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;

      const { data } = await supabaseBrowser
        .from('user_profiles')
        .select('full_name, streak_days')
        .eq('user_id', uid)
        .maybeSingle();

      setName((data as any)?.full_name ?? null);
      setStreak((data as any)?.streak_days ?? 0);
    })();
  }, []);

  // Word of the day (robust normalization → always strings)
  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingWord(true);
      try {
        const r = await fetch('/api/words/today');
        const j = await r.json();
        if (!active) return;
        setWod(normalizeWod(j));
      } catch {
        if (!active) return;
        setWod(normalizeWod(null));
      } finally {
        if (active) setLoadingWord(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const greeting = useMemo(
    () => (name ? `Welcome, ${name.split(' ')[0]} 👋` : 'Welcome to GramorX'),
    [name]
  );

  return (
    <section className="py-16">
      <Container>
        {/* HERO */}
        <div className="rounded-ds-2xl border border-border bg-card text-card-foreground p-8 mb-10 header-glass">
          <div className="flex flex-wrap items-center gap-6 justify-between">
            <div>
              <h1 className="font-slab text-3xl md:text-4xl mb-2">{greeting}</h1>
              <p className="text-mutedText max-w-2xl">
                Kickstart your IELTS prep with AI-powered practice, instant feedback, and a clear plan across all four modules.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-ds-xl"><Link href="/profile">Begin Onboarding</Link></Button>
                <Button asChild variant="secondary" className="rounded-ds-xl"><Link href="/dashboard">Go to Dashboard</Link></Button>
                <Button asChild variant="ghost" className="rounded-ds-xl"><Link href="/band-predictor">Try Band Predictor</Link></Button>
              </div>
            </div>

            <div className="min-w-[220px]">
              <div className="rounded-ds-2xl border border-border bg-background/60 p-4">
                <div className="mb-2 text-sm text-mutedText">Your streak</div>
                <StreakIndicator value={streak} />
                <div className="mt-2 text-sm text-mutedText">Keep a daily streak to unlock bonus mock tests.</div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK START */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-ds-2xl border border-border bg-card p-5">
            <div className="text-sm mb-2 text-mutedText">Step 1</div>
            <h3 className="font-semibold mb-2">Set your target band</h3>
            <p className="text-sm text-mutedText mb-4">Pick a goal and we’ll tailor your plan.</p>
            <Button asChild size="sm" className="rounded-ds-xl"><Link href="/profile#goal">Choose target</Link></Button>
          </div>
          <div className="rounded-ds-2xl border border-border bg-card p-5">
            <div className="text-sm mb-2 text-mutedText">Step 2</div>
            <h3 className="font-semibold mb-2">Take a placement test</h3>
            <p className="text-sm text-mutedText mb-4">Get an instant estimate of your current band.</p>
            <Button asChild size="sm" variant="secondary" className="rounded-ds-xl"><Link href="/band-predictor">Start test</Link></Button>
          </div>
          <div className="rounded-ds-2xl border border-border bg-card p-5">
            <div className="text-sm mb-2 text-mutedText">Step 3</div>
            <h3 className="font-semibold mb-2">Begin daily practice</h3>
            <p className="text-sm text-mutedText mb-4">Short, focused tasks to build momentum.</p>
            <Button asChild size="sm" variant="ghost" className="rounded-ds-xl"><Link href="/challenge">Go to daily tasks</Link></Button>
          </div>
        </div>

        {/* MODULES */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-xl">IELTS Modules</h2>
          <Link href="/modules" className="text-primary hover:underline">View all</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <ModuleCard title="Listening" href="/listening" caption="Section-wise practice with transcripts and timings." chip="Practice" />
          <ModuleCard title="Reading" href="/reading" caption="True/False/NG, MCQs and passage strategy." chip="Practice" />
          <ModuleCard title="Writing" href="/writing" caption="Task 1 & Task 2 with AI scoring and tips." chip="AI Feedback" />
          <ModuleCard title="Speaking" href="/speaking" caption="Part 1–3 prompts with recording & evaluation." chip="Record" />
        </div>

        {/* WORD OF THE DAY + BAND PREDICTOR */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-ds-2xl border border-border bg-card p-6">
            <div className="mb-2 flex items-center gap-2"><Badge variant="success">Word of the day</Badge></div>
            {loadingWord ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-primary/10 rounded" />
                <div className="h-4 bg-primary/10 rounded w-3/4" />
                <div className="h-4 bg-primary/10 rounded w-2/3" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-slab">{wod?.word ?? ''}</div>
                {wod?.meaning ? <p className="text-mutedText mt-2">{wod.meaning}</p> : null}
                {wod?.example ? <p className="text-sm mt-2 italic">“{wod.example}”</p> : null}
              </>
            )}
          </div>

          <div className="rounded-ds-2xl border border-border bg-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="mb-1 text-sm text-mutedText">Unsure where to start?</div>
              <h3 className="text-xl font-semibold">Band Predictor</h3>
              <p className="text-sm text-mutedText mt-1">A quick adaptive test to gauge your current level.</p>
            </div>
            <Button asChild className="rounded-ds-xl"><Link href="/band-predictor">Start now</Link></Button>
          </div>
        </div>

        {/* HELP CTA */}
        <div className="mt-10 flex items-center justify-between rounded-ds-2xl border border-border bg-card p-6">
          <div>
            <h4 className="font-semibold mb-1">Need help?</h4>
            <p className="text-sm text-mutedText">Ask the community or talk to our AI assistant.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="secondary" className="rounded-ds-xl"><Link href="/community">Visit Community</Link></Button>
            <Button asChild variant="ghost" className="rounded-ds-xl"><Link href="/ai">Open AI Assistant</Link></Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
