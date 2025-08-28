// pages/learning/strategies/index.tsx
import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// ---- Types -----------------------------------------------------------------

type SkillArea = 'listening' | 'reading' | 'writing' | 'speaking';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface Strategy {
  slug: string;
  title: string;
  summary: string;
  skill: SkillArea;
  difficulty: Difficulty;
  tags: string[];
}

// ---- Data (Phase-1: static seeds; later: fetch from DB) --------------------

const STRATEGIES: readonly Strategy[] = [
  {
    slug: 'active-listening-note-anchors',
    title: 'Active Listening with Note Anchors',
    summary:
      'Use time-stamped anchors to capture names, numbers, and directions during Sections 2–4. Train selective attention rather than writing everything.',
    skill: 'listening',
    difficulty: 'intermediate',
    tags: ['time-anchoring', 'numbers', 'directions'],
  },
  {
    slug: 'reading-skim-scan-grid',
    title: 'Skim–Scan Grid for Passages',
    summary:
      'Skim each passage in 90 seconds to build a mental grid (topic, tone, structure), then scan for keywords to answer in batches.',
    skill: 'reading',
    difficulty: 'beginner',
    tags: ['skimming', 'scanning', 'keywords'],
  },
  {
    slug: 'writing-task-2-peel',
    title: 'Writing Task 2: PEEL Paragraphs',
    summary:
      'Develop each body paragraph with Point–Evidence–Explanation–Link, ensuring topic cohesion and clear band-descriptor coverage.',
    skill: 'writing',
    difficulty: 'intermediate',
    tags: ['coherence', 'cohesion', 'task-response'],
  },
  {
    slug: 'speaking-band-lexical-sets',
    title: 'Speaking: Band 7+ Lexical Sets',
    summary:
      'Prepare 10 lexical sets with collocations and substitutions to naturally vary vocabulary without sounding memorized.',
    skill: 'speaking',
    difficulty: 'advanced',
    tags: ['vocabulary', 'collocations', 'fluency'],
  },
  {
    slug: 'reading-tfng-traps',
    title: 'True/False/Not Given Traps',
    summary:
      'Identify “scope creep” and absolute words to avoid NG/F mismatches; verify statement scope vs passage evidence.',
    skill: 'reading',
    difficulty: 'intermediate',
    tags: ['question-types', 'trap-words'],
  },
  {
    slug: 'listening-map-labs',
    title: 'Map Labelling: Compass First',
    summary:
      'Before audio starts, mark N/E/S/W and landmarks. Track paths with finger and predict likely answer types.',
    skill: 'listening',
    difficulty: 'beginner',
    tags: ['maps', 'prediction', 'orientation'],
  },
  {
    slug: 'writing-task-1-academics',
    title: 'Task 1 Academic: Trend Bundles',
    summary:
      'Group trends (rise/fall/plateau) and compare extremes; avoid raw data dumping. Use approximate but accurate figures.',
    skill: 'writing',
    difficulty: 'advanced',
    tags: ['data-commentary', 'comparisons'],
  },
  {
    slug: 'speaking-part-3-extend',
    title: 'Speaking Part 3: Extend & Balance',
    summary:
      'Answer → Reason → Example → Mini-counterpoint. Keep ~4–6 sentence arcs to demonstrate depth without rambling.',
    skill: 'speaking',
    difficulty: 'intermediate',
    tags: ['development', 'coherence'],
  },
] as const;

// ---- Helpers ---------------------------------------------------------------

const SKILL_OPTIONS: readonly { value: SkillArea | 'all'; label: string }[] = [
  { value: 'all', label: 'All skills' },
  { value: 'listening', label: 'Listening' },
  { value: 'reading', label: 'Reading' },
  { value: 'writing', label: 'Writing' },
  { value: 'speaking', label: 'Speaking' },
];

const DIFFICULTY_OPTIONS: readonly {
  value: Difficulty | 'all';
  label: string;
}[] = [
  { value: 'all', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// ---- Page ------------------------------------------------------------------

export default function StrategiesIndexPage(): JSX.Element {
  const router = useRouter();

  // read defaults from query (SSR-safe: guard with isReady)
  const [q, setQ] = useState<string>('');
  const [skill, setSkill] = useState<SkillArea | 'all'>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');

  useEffect(() => {
    if (!router.isReady) return;
    const queryQ = (router.query.q as string) || '';
    const querySkill = (router.query.skill as SkillArea) || 'all';
    const queryDiff = (router.query.difficulty as Difficulty) || 'all';
    setQ(queryQ);
    setSkill(
      ['listening', 'reading', 'writing', 'speaking'].includes(querySkill)
        ? querySkill
        : 'all'
    );
    setDifficulty(
      ['beginner', 'intermediate', 'advanced'].includes(queryDiff)
        ? (queryDiff as Difficulty)
        : 'all'
    );
  }, [router.isReady, router.query.difficulty, router.query.q, router.query.skill]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return STRATEGIES.filter((s) => {
      const matchTerm =
        term.length === 0 ||
        s.title.toLowerCase().includes(term) ||
        s.summary.toLowerCase().includes(term) ||
        s.tags.some((t) => t.toLowerCase().includes(term));
      const matchSkill = skill === 'all' || s.skill === skill;
      const matchDiff = difficulty === 'all' || s.difficulty === difficulty;
      return matchTerm && matchSkill && matchDiff;
    });
  }, [q, skill, difficulty]);

  // explicit handler (no short-circuit expressions → keeps ESLint happy)
  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const nextQuery: Record<string, string> = {};
    if (q.trim()) nextQuery.q = q.trim();
    if (skill !== 'all') nextQuery.skill = skill;
    if (difficulty !== 'all') nextQuery.difficulty = difficulty;
    void router.push({ pathname: '/learning/strategies', query: nextQuery }, undefined, {
      shallow: true,
    });
  };

  return (
    <main className="min-h-[100dvh] px-4 py-8 md:px-8">
      {/* Breadcrumb / quick nav */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/learning" className="underline-offset-2 hover:underline">
              Learning
            </Link>
          </li>
          <li className="opacity-60">/</li>
          <li className="font-medium">Strategies</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">IELTS Strategies</h1>
          <p className="text-sm text-muted-foreground">
            Practical methods to boost your Listening, Reading, Writing & Speaking.
          </p>
        </div>

        {/* Useful links (dynamic, DS rule: use Link not <a>) */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/listening"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Listening
          </Link>
          <Link
            href="/reading"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Reading
          </Link>
          <Link
            href="/writing"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Writing
          </Link>
          <Link
            href="/speaking"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Speaking
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
          >
            My Plan
          </Link>
        </div>
      </header>

      {/* Filters */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by keyword or tag…"
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value as SkillArea | 'all')}
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          aria-label="Filter by skill"
        >
          {SKILL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty | 'all')}
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          aria-label="Filter by difficulty"
        >
          {DIFFICULTY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Apply
          </button>
          <Link
            href="/learning/strategies"
            className="h-10 rounded-lg border px-4 text-sm grid place-items-center hover:bg-accent"
          >
            Reset
          </Link>
        </div>
      </form>

      {/* Results */}
      <section aria-live="polite" className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{filtered.length}</span> strategy
          {filtered.length === 1 ? '' : 'ies'}
        </div>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <li key={s.slug} className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize">
                  {s.skill}
                </span>
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize">
                  {s.difficulty}
                </span>
              </div>

              <h2 className="mb-1 text-lg font-semibold leading-snug">
                <Link
                  href={`/learning/strategies/${s.slug}`}
                  className="underline-offset-2 hover:underline"
                >
                  {s.title}
                </Link>
              </h2>

              <p className="mb-3 text-sm text-muted-foreground">{s.summary}</p>

              <div className="mb-4 flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <Link
                    key={t}
                    href={{ pathname: '/learning/strategies', query: { q: t } }}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs hover:bg-accent"
                  >
                    #{t}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/learning/strategies/${s.slug}`}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:opacity-90"
                >
                  View details
                </Link>
                <Link
                  href={`/practice?from=strategy&slug=${s.slug}`}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  Start practice
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
            No strategies match your filters. Try clearing filters or different keywords.
          </div>
        )}
      </section>

      {/* Footer quick routes */}
      <footer className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Link href="/learning" className="rounded-lg border px-3 py-2 text-sm hover:bg-accent">
          ← Back to Learning
        </Link>
        <Link href="/reading/papers" className="rounded-lg border px-3 py-2 text-sm hover:bg-accent">
          Reading Papers
        </Link>
        <Link
          href="/listening/tests"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-accent"
        >
          Listening Tests
        </Link>
        <Link
          href="/writing/samples"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-accent"
        >
          Band 9 Samples
        </Link>
      </footer>
    </main>
  );
}
