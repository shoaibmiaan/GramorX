import { env } from "@/lib/env";
// pages/reading/review/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { useLocale } from '@/lib/locale';
import { translateExplanation } from '@/lib/explanations';
import { type AnswerValue } from '@/components/reading/useReadingAnswers';

import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';

type Kind = 'tfng' | 'mcq' | 'matching' | 'short';

type ReviewQuestion = {
  id: string;
  order_no: number;
  kind: Kind;
  prompt: string;
  options?: string[]; // mcq
  pairs?: { left: string; right: string[] }[]; // matching
  answers: AnswerValue | AnswerValue[]; // canonical correct answer(s) from DB
  points: number;
};

type Passage = {
  slug: string;
  title: string;
  difficulty: 'Academic' | 'General';
  words: number | null;
  contentHtml: string;
};

type Props = {
  passage: Passage | null;
  questions: ReviewQuestion[];
  error?: string | null;
  notFound?: boolean;
};

const TimerProgress = dynamic(() => import('@/components/reading/TimerProgress'), { ssr: false }); // optional cosmetic

// ---------- helpers (local scoring same as API) ----------
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
  const slug = (ctx.query.slug as string) || '';
  if (!slug) {
    return { props: { passage: null, questions: [], error: 'Missing slug', notFound: false } };
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return {
      props: { passage: null, questions: [], error: 'Supabase env missing', notFound: false },
    };
  }
  const supabase = createClient(url, anon);

  const { data: passageRow, error: pErr } = await supabase
    .from('reading_passages')
    .select('slug,title,difficulty,words,content')
    .eq('slug', slug)
    .single();

  if (pErr || !passageRow) {
    return { props: { passage: null, questions: [], notFound: true, error: pErr?.message ?? null } };
  }

  const { data: qRows, error: qErr } = await supabase
    .from('reading_questions')
    .select('id,order_no,kind,prompt,options,answers,points')
    .eq('passage_slug', passageRow.slug)
    .order('order_no', { ascending: true });

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
          ? (Array.isArray(row.options?.pairs) ? row.options.pairs : [])
          : undefined,
      answers: row.answers, // keep correct answers for review
      points: row.points ?? 1,
    };
  });

  const passage: Passage = {
    slug: passageRow.slug,
    title: passageRow.title,
    difficulty: passageRow.difficulty ?? 'Academic',
    words: passageRow.words ?? null,
    contentHtml: String(passageRow.content ?? ''),
  };

  return { props: { passage, questions, error: qErr?.message ?? null } };
};

const ReviewPage: NextPage<Props> = ({ passage, questions, notFound, error }) => {
  const router = useRouter();
  const attemptId = (router.query.attemptId as string) || null;
  const slug = (router.query.slug as string) || passage?.slug || '';

  const [answers, setAnswers] = useState<Record<string, AnswerValue> | null>(
    null,
  );
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const { explanationLocale } = useLocale();

  // Load answers:
  // 1) If attemptId: fetch attempt from Supabase with user token
  // 2) Else fallbacks: sessionStorage/localStorage keys (best-effort)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Attempt: fetch from DB if we have attemptId + token
        if (attemptId) {
          const url = env.NEXT_PUBLIC_SUPABASE_URL;
          const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(url, anon);
          const { data: { session } } = await supabase.auth.getSession();
          const authHeader = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

          // Use REST query to respect RLS with user context via header
          const resp = await fetch(`${url}/rest/v1/reading_attempts?id=eq.${attemptId}&select=answers`, {
            headers: {
              apikey: anon,
              ...authHeader,
            },
          });
          if (resp.ok) {
            const arr = await resp.json();
            const rec = Array.isArray(arr) ? arr[0] : null;
            if (!cancelled && rec?.answers) {
              setAnswers(rec.answers);
              return;
            }
          }
        }

        // Fallbacks
        const keys = [
          `readingAnswers:${slug}`,
          `reading:${slug}`,
          `answers:${slug}`,
          `draft:${slug}`,
        ];
        for (const k of keys) {
          try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(k) : null;
            if (raw) {
              const parsed = JSON.parse(raw);
              if (!cancelled && parsed && typeof parsed === 'object') {
                // Some drafts save a shape like { answers: {...} }
                setAnswers(parsed.answers ?? parsed);
                return;
              }
            }
          } catch {}
        }

        // As a last attempt, try sessionStorage (older step stored result here)
        try {
          const raw = typeof window !== 'undefined'
            ? window.sessionStorage.getItem(`readingResult:${slug}`)
            : null;
          if (raw) {
            const parsed = JSON.parse(raw);
            if (!cancelled && parsed?.answers) {
              setAnswers(parsed.answers);
              return;
            }
          }
        } catch {}

        if (!cancelled) setLoadErr('No saved answers were found for this attempt.');
      } catch (e: any) {
        if (!cancelled) setLoadErr(e?.message ?? 'Could not load answers.');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [attemptId, slug]);

  // Compute score locally (works for either DB or fallback answers)
  const score = useMemo(() => {
    if (!answers) return null;
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
      if (isCorrect(q, answers[q.id])) {
        correct += pts;
        byType[q.kind].correct += pts;
      }
    });
    return { total, correct, byType };
  }, [answers, questions]);

  async function explain(q: ReviewQuestion) {
    try {
      const payload = {
        passage: passage?.contentHtml ?? '',
        question: { kind: q.kind, prompt: q.prompt, id: q.id },
        userAnswer: answers ? answers[q.id] : null,
        correctAnswer:
          Array.isArray(q.answers) && q.kind !== 'matching' ? q.answers[0] : q.answers,
      };
      const res = await fetch('/api/reading/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.explanation) {
        const text = await translateExplanation(json.explanation, explanationLocale);
        setExplanations((prev) => ({ ...prev, [q.id]: text }));
      }
    } catch {
      setExplanations((prev) => ({ ...prev, [q.id]: 'Could not load explanation right now.' }));
    }
  }

  if (notFound || !passage) {
    return (
      <section className="py-24">
        <Container>
          <Card className="card-surface p-6 rounded-ds-2xl">
            <h2 className="text-h3 font-semibold mb-2">Passage not found</h2>
            <p className="text-grayish">Please go back and pick another reading passage.</p>
          </Card>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        {/* Optional: Keep top timer strip for consistency */}
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

        {!answers && (
          <Alert variant="error" title="Answers missing" className="mb-6">
            {loadErr ?? 'We could not find your answers. If you just finished the test, please try submitting again while logged in.'}
          </Alert>
        )}

        {score && (
          <Card className="card-surface p-6 rounded-ds-2xl mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Score: {score.correct} / {score.total}</Badge>
              <Badge variant="neutral">
                TF/NG: {score.byType.tfng.correct}/{score.byType.tfng.total}
              </Badge>
              <Badge variant="neutral">
                MCQ: {score.byType.mcq.correct}/{score.byType.mcq.total}
              </Badge>
              <Badge variant="neutral">
                Matching: {score.byType.matching.correct}/{score.byType.matching.total}
              </Badge>
              <Badge variant="neutral">
                Short: {score.byType.short.correct}/{score.byType.short.total}
              </Badge>
            </div>
          </Card>
        )}

        <div className="grid gap-6">
          {questions.map((q, idx) => {
            const user = answers ? answers[q.id] : undefined;
            const ok = answers ? isCorrect(q, user) : false;

            const answerBlock = (
              <div className="mt-3 grid gap-2">
                <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                  <div className="text-small opacity-80 mb-1">Your answer</div>
                  <div className={ok ? 'text-success' : 'text-sunsetOrange'}>
                    {formatAnswer(q, user) ?? <span className="opacity-60">—</span>}
                  </div>
                </div>
                <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                  <div className="text-small opacity-80 mb-1">Correct</div>
                  <div className="opacity-95">{formatAnswer(q, q.answers)}</div>
                </div>
              </div>
            );

            return (
              <Card key={q.id} className="card-surface p-6 rounded-ds-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-small opacity-70 mb-1">Question {idx + 1}</div>
                    <h3 className="text-h3 font-semibold">{q.prompt}</h3>
                    {q.kind === 'mcq' && q.options && (
                      <ul className="mt-2 list-disc pl-5 text-body opacity-80">
                        {q.options.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
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
                    {answerBlock}
                  </div>

                  <div className="shrink-0">
                    <Badge variant={ok ? 'success' : 'danger'}>{ok ? 'Correct' : 'Incorrect'}</Badge>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button
                    variant="secondary"
                    className="rounded-ds-xl"
                    onClick={() => explain(q)}
                    aria-label={`Explain question ${idx + 1}`}
                  >
                    Explain
                  </Button>
                </div>

                {explanations[q.id] && (
                  <div className="mt-4 p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                    <div className="text-small font-semibold mb-1">Explanation</div>
                    <p className="text-body opacity-90">{explanations[q.id]}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            as="a"
            href={`/reading/passage/${encodeURIComponent(passage.slug)}`}
            variant="primary"
            className="rounded-ds-xl"
          >
            Retake Passage
          </Button>
          <Button
            as="a"
            href="/reading"
            variant="secondary"
            className="rounded-ds-xl"
          >
            Back to Reading List
          </Button>
        </div>
      </Container>
    </section>
  );
};

// Pretty-print for various answer shapes
function formatAnswer(q: ReviewQuestion, ans: any): React.ReactNode {
  if (ans == null) return null;
  if (q.kind === 'matching') {
    if (Array.isArray(ans)) return ans.join(' • ');
    return String(ans);
  }
  if (Array.isArray(ans)) return ans.join(' / ');
  return String(ans);
}

export default ReviewPage;
