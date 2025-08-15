// pages/reading/review/[attemptId].tsx
import React, { useMemo, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';

const TimerProgress = dynamic(() => import('@/components/reading/TimerProgress'), { ssr: false });

type Kind = 'tfng' | 'mcq' | 'matching' | 'short';

type ReviewQuestion = {
  id: string;
  order_no: number;
  kind: Kind;
  prompt: string;
  options?: string[]; // mcq
  pairs?: { left: string; right: string[] }[]; // matching
  answers: any; // canonical correct answers from DB
  points: number;
};

type Passage = {
  slug: string;
  title: string;
  difficulty: 'Academic' | 'General';
  words: number | null;
  contentHtml: string;
};

type AttemptRow = {
  id: string;
  passage_slug: string;
  total: number;
  correct: number;
  by_type: Record<string, { total: number; correct: number }>;
  answers: Record<string, any>;
  created_at: string;
};

type Props = {
  attempt: AttemptRow;
  passage: Passage;
  questions: ReviewQuestion[];
  error?: string | null;
};

// ---------- helpers (same normalization/scoring you use in index.tsx) ----------
const norm = (s: any) =>
  typeof s === 'string' ? s.trim().replace(/\s+/g, ' ').toLowerCase() : s;

function isCorrect(q: ReviewQuestion, user: any) {
  switch (q.kind) {
    case 'tfng': {
      const expected = Array.isArray(q.answers) ? q.answers[0] : q.answers;
      return user === expected;
    }
    case 'mcq': {
      const expected = Array.isArray(q.answers) ? q.answers[0] : q.answers;
      return norm(user) === norm(expected);
    }
    case 'short': {
      const arr = Array.isArray(q.answers) ? q.answers : [];
      return arr.some((a) => norm(a) === norm(user));
    }
    case 'matching': {
      const exp = Array.isArray(q.answers) ? q.answers : [];
      return (
        Array.isArray(user) &&
        user.length === exp.length &&
        user.every((u, i) => norm(u) === norm(exp[i]))
      );
    }
    default:
      return false;
  }
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const attemptId = ctx.params?.attemptId as string;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
  if (!url || !serviceKey) {
    return {
      props: {
        error: 'Supabase env missing',
        attempt: { id: attemptId, passage_slug: '', total: 0, correct: 0, by_type: {}, answers: {}, created_at: new Date().toISOString() } as any,
        passage: { slug: '', title: 'Reading', difficulty: 'Academic', words: null, contentHtml: '' },
        questions: [],
      },
    };
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // 1) Attempt (authoritative)
  const { data: attempt, error: aErr } = await admin
    .from('reading_attempts')
    .select('id,passage_slug,total,correct,by_type,answers,created_at')
    .eq('id', attemptId)
    .single();

  if (aErr || !attempt) {
    return { notFound: true };
  }

  // 2) Passage
  const { data: pRow, error: pErr } = await admin
    .from('reading_passages')
    .select('slug,title,difficulty,words,content')
    .eq('slug', attempt.passage_slug)
    .single();

  // 3) Questions (with correct answers)
  const { data: qRows, error: qErr } = await admin
    .from('reading_questions')
    .select('id,order_no,kind,prompt,options,answers,points')
    .eq('passage_slug', attempt.passage_slug)
    .order('order_no', { ascending: true });

  const passage: Passage = pRow
    ? {
        slug: pRow.slug,
        title: pRow.title,
        difficulty: (pRow.difficulty ?? 'Academic') as Passage['difficulty'],
        words: pRow.words ?? null,
        contentHtml: String(pRow.content ?? ''),
      }
    : { slug: attempt.passage_slug, title: 'Reading Passage', difficulty: 'Academic', words: null, contentHtml: '' };

  const questions: ReviewQuestion[] = (qRows ?? []).map((row: any) => {
    const kind = row.kind as Kind;
    return {
      id: row.id,
      order_no: row.order_no ?? 0,
      kind,
      prompt: row.prompt,
      options:
        kind === 'mcq'
          ? (Array.isArray(row.options) ? row.options : row.options?.options ?? [])
          : undefined,
      pairs:
        kind === 'matching'
          ? (Array.isArray(row.options?.pairs) ? row.options.pairs : Array.isArray(row.options) ? row.options : [])
          : undefined,
      answers: row.answers,
      points: row.points ?? 1,
    };
  });

  return {
    props: {
      attempt,
      passage,
      questions,
      error: pErr?.message ?? qErr?.message ?? null,
    },
  };
};

const ReviewAttemptPage: NextPage<Props> = ({ attempt, passage, questions, error }) => {
  const [explanations, setExplanations] = useState<Record<string, { loading: boolean; text?: string; error?: string }>>({});

  // Even though attempt carries totals, recompute so badges & per-question state are always correct
  const score = useMemo(() => {
    let total = 0;
    let correct = 0;
    const byType: Record<Kind, { total: number; correct: number }> = {
      tfng: { total: 0, correct: 0 },
      mcq: { total: 0, correct: 0 },
      matching: { total: 0, correct: 0 },
      short: { total: 0, correct: 0 },
    };
    questions.forEach((q) => {
      const pts = q.points ?? 1;
      total += pts;
      byType[q.kind].total += pts;
      if (isCorrect(q, attempt.answers[q.id])) {
        correct += pts;
        byType[q.kind].correct += pts;
      }
    });
    return { total, correct, byType };
  }, [questions, attempt.answers]);

  const overallPct = score.total ? Math.round((score.correct / score.total) * 100) : 0;

  async function explain(q: ReviewQuestion) {
    if (explanations[q.id]?.loading) return;
    const userAnswer = attempt.answers[q.id];
    const correctAnswer =
      q.kind === 'matching' ? q.answers :
      q.kind === 'short' ? (Array.isArray(q.answers) ? q.answers[0] : q.answers) :
      Array.isArray(q.answers) ? q.answers[0] : q.answers;

    setExplanations((s) => ({ ...s, [q.id]: { loading: true } }));
    try {
      const res = await fetch('/api/reading/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage: passage.contentHtml,
          question: { kind: q.kind, prompt: q.prompt, id: q.id },
          userAnswer,
          correctAnswer,
        }),
      });
      const data = await res.json();
      if (data?.explanation) {
        setExplanations((s) => ({ ...s, [q.id]: { loading: false, text: data.explanation } }));
      } else {
        setExplanations((s) => ({ ...s, [q.id]: { loading: false, error: 'No explanation returned.' } }));
      }
    } catch (e: any) {
      setExplanations((s) => ({ ...s, [q.id]: { loading: false, error: e?.message ?? 'Failed to fetch explanation.' } }));
    }
  }

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <TimerProgress total={questions.length} elapsedSec={0} />

        <header className="mb-6">
          <h1 className="font-slab text-h1 md:text-display">Review — {passage.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="info">{passage.difficulty}</Badge>
            {typeof passage.words === 'number' && passage.words > 0 && (
              <Badge variant="neutral">{passage.words} words</Badge>
            )}
            <Badge variant="neutral">{questions.length} questions</Badge>
          </div>
        </header>

        {error && (
          <Alert variant="warning" title="Some data could not be loaded" className="mb-6">
            {error}
          </Alert>
        )}

        <Card className="card-surface p-6 rounded-ds-2xl mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">Score: {score.correct} / {score.total} ({overallPct}%)</Badge>
            <Badge variant="neutral">TF/NG: {score.byType.tfng.correct}/{score.byType.tfng.total}</Badge>
            <Badge variant="neutral">MCQ: {score.byType.mcq.correct}/{score.byType.mcq.total}</Badge>
            <Badge variant="neutral">Matching: {score.byType.matching.correct}/{score.byType.matching.total}</Badge>
            <Badge variant="neutral">Short: {score.byType.short.correct}/{score.byType.short.total}</Badge>
          </div>
        </Card>

        {/* Passage (optional) */}
        <Card className="card-surface p-6 rounded-ds-2xl mb-8">
          <article className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: passage.contentHtml }} />
        </Card>

        <div className="grid gap-6">
          {questions.map((q, idx) => {
            const user = attempt.answers[q.id];
            const ok = isCorrect(q, user);

            const userDisplay =
              q.kind === 'matching'
                ? (Array.isArray(user) ? user.join(' • ') : '—')
                : Array.isArray(user) ? user.join(' / ') : (user ?? '—');

            const correctDisplay =
              q.kind === 'matching'
                ? (Array.isArray(q.answers) ? q.answers.join(' • ') : String(q.answers))
                : Array.isArray(q.answers)
                ? q.answers[0]
                : String(q.answers ?? '—');

            return (
              <Card key={q.id} className="card-surface p-6 rounded-ds-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-small opacity-70 mb-1">Question {idx + 1} · {q.kind.toUpperCase()}</div>
                    <h3 className="text-h3 font-semibold">{q.prompt}</h3>

                    {q.kind === 'mcq' && q.options && (
                      <ul className="mt-2 list-disc pl-5 text-body opacity-80">
                        {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                      </ul>
                    )}

                    {q.kind === 'matching' && q.pairs && (
                      <div className="mt-2 grid gap-2">
                        {q.pairs.map((p, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="text-small opacity-70 w-32">{p.left}</span>
                            <span className="text-small opacity-80">→ {Array.isArray(p.right) ? p.right.join(' / ') : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 grid gap-2">
                      <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                        <div className="text-small opacity-80 mb-1">Your answer</div>
                        <div className={ok ? 'text-success' : 'text-sunsetOrange'}>{userDisplay}</div>
                      </div>
                      <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                        <div className="text-small opacity-80 mb-1">Correct</div>
                        <div className="opacity-95">{correctDisplay}</div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Badge variant={ok ? 'success' : 'danger'}>{ok ? 'Correct' : 'Incorrect'}</Badge>
                  </div>
                </div>

                <div className="mt-4">
                  <Button variant="secondary" className="rounded-ds-xl" onClick={() => explain(q)} aria-label={`Explain question ${idx + 1}`}>
                    {explanations[q.id]?.loading ? 'Explaining…' : 'Explain'}
                  </Button>

                  {explanations[q.id]?.text && (
                    <div className="mt-3">
                      <Alert variant="info" title="Explanation">
                        {explanations[q.id]?.text}
                      </Alert>
                    </div>
                  )}
                  {explanations[q.id]?.error && (
                    <div className="mt-3">
                      <Alert variant="error" title="Couldn’t fetch explanation">
                        {explanations[q.id]?.error}
                      </Alert>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex gap-3">
          <Button as="a" href={`/reading/passage/${encodeURIComponent(passage.slug)}`} variant="primary" className="rounded-ds-xl">
            Retake Passage
          </Button>
          <Button as="a" href="/reading" variant="secondary" className="rounded-ds-xl">
            Back to Reading List
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default ReviewAttemptPage;
