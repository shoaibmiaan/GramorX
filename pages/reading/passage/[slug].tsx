import { env } from "@/lib/env";
// pages/reading/passage/[slug].tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/design-system/Input';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type QKind = 'tfng' | 'mcq' | 'matching' | 'short';

type Question = {
  id: string;
  order_no: number;
  kind: QKind;
  prompt: string;
  options: any;   // jsonb
  answers: any;   // jsonb
  points: number | null;
};

type Props = {
  slug: string;
  title: string;
  difficulty: 'Academic' | 'General';
  words: number | null;
  content: string;
  questions: Question[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug ?? '');
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(url, anon, { auth: { persistSession: false } });

  const [{ data: passage }, { data: qRows }] = await Promise.all([
    supabase
      .from('reading_passages')
      .select('slug,title,difficulty,words,content')
      .eq('slug', slug)
      .single(),
    supabase
      .from('reading_questions')
      .select('id,order_no,kind,prompt,options,answers,points')
      .eq('passage_slug', slug)
      .order('order_no', { ascending: true }),
  ]);

  if (!passage || !qRows?.length) return { notFound: true };

  return {
    props: {
      slug: passage.slug,
      title: passage.title,
      difficulty: (passage.difficulty as any) ?? 'Academic',
      words: (passage.words as any) ?? null,
      content: passage.content,
      questions: qRows as Question[],
    },
  };
};

export default function ReadingRunner({ slug, title, difficulty, words, content, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sec, setSec] = useState(60 * 30); // 30 minutes

  // -------- Draft (restore on mount, save on demand) --------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`reading_draft_${slug}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.answers && typeof parsed.answers === 'object') {
          setAnswers(parsed.answers);
        }
      }
    } catch {}
  }, [slug]);

  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(`reading_draft_${slug}`, JSON.stringify({ answers }));
    } catch {}
  }, [slug, answers]);

  // -------- Timer --------
  useEffect(() => {
    const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const hhmmss = (n: number) => {
    const h = Math.floor(n / 3600);
    const m = Math.floor((n % 3600) / 60);
    const s = n % 60;
    return [h, m, s].map((x) => String(x).padStart(2, '0')).join(':');
  };

  const maxPts = useMemo(() => questions.reduce((s, q) => s + (q.points ?? 1), 0), [questions]);

  // -------- Answer setter --------
  const put = (q: Question, value: any) => {
    setAnswers((a) => ({ ...a, [q.id]: value })); // store by id (API also accepts order_no)
  };

  // -------- Submit --------
  const handleSubmit = async () => {
    // Persist draft first (safety)
    saveDraft();

    const { data: { session } } = await supabaseBrowser.auth.getSession();
    const token = session?.access_token ?? '';

    const r = await fetch('/api/reading/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        passageSlug: slug,
        answers,
        durationMs: (60 * 30 - sec) > 0 ? (60 * 30 - sec) * 1000 : null,
      }),
    });

    const json = await r.json();
    if (json?.attemptId) {
      window.location.href = `/reading/review/${json.attemptId}`;
    } else if (json?.score) {
      alert(`Score: ${json.score.correct} / ${json.score.total}`);
    } else {
      alert('Submit failed. Please try again.');
    }
  };

  return (
    <div className="py-24">
      <Container>
        {/* Header + Meta */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="flex items-center gap-3">
            <Badge>{difficulty}</Badge>
            {typeof words === 'number' && words > 0 && <Badge>{words} words</Badge>}
            <Badge>{questions.length} questions</Badge>
            <Badge>Max {maxPts} pts</Badge>
            <Badge>⏱ {hhmmss(sec)}</Badge>
            <Badge>Answered: {Object.keys(answers).length}/{questions.length}</Badge>
          </div>
        </div>

        {/* Passage */}
        <Card className="p-6 mb-8">
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
            {content}
          </div>
        </Card>

        {/* Questions */}
        <div className="grid gap-4">
          {questions.map((q) => (
            <Card key={q.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="font-medium">
                  <span className="text-gray-500 mr-2">Question {q.order_no}.</span>
                  {q.prompt}
                </div>
                <Badge>{q.kind.toUpperCase()}</Badge>
              </div>

              {q.kind === 'tfng' && (
                <div className="flex flex-wrap gap-2">
                  {['True', 'False', 'Not Given'].map((opt) => (
                    <Button
                      key={opt}
                      variant={String(answers[q.id]) === opt ? 'primary' : 'secondary'}
                      className="rounded-ds-xl"
                      onClick={() => put(q, opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}

              {q.kind === 'mcq' && (
                <div className="grid gap-2">
                  {(Array.isArray(q.options) ? q.options : []).map((opt: string, i: number) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        checked={String(answers[q.id] ?? '') === opt}
                        onChange={() => put(q, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.kind === 'short' && (
                <Input
                  placeholder="Type your answer"
                  value={answers[q.id] ?? ''}
                  onChange={(e) => put(q, e.target.value)}
                />
              )}

              {q.kind === 'matching' && (
                <Input
                  placeholder="Enter comma-separated matches e.g. A,B,C,D"
                  value={
                    Array.isArray(answers[q.id])
                      ? (answers[q.id] as any[]).join(',')
                      : (answers[q.id] ?? '')
                  }
                  onChange={(e) => put(q, e.target.value.split(',').map((s) => s.trim()))}
                />
              )}
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-8">
          <Link href="/reading" className="text-sm underline">
            Back to Catalog
          </Link>
          <div className="flex gap-3">
            <Button variant="secondary" className="rounded-ds-xl" onClick={saveDraft}>
              Save Draft
            </Button>
            <Button variant="primary" className="rounded-ds-xl" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
