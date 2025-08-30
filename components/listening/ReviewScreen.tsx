import { env } from "@/lib/env";
import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card } from '@/components/design-system/Card';
import { Alert } from '@/components/design-system/Alert';
import { EmptyState } from '@/components/design-system/EmptyState';
import { Skeleton } from '@/components/design-system/Skeleton';
import { ScoreCard } from '@/components/design-system/ScoreCard';
import AnswerReview from '@/components/listening/AnswerReview'; // ✅ default import
import { isCorrect } from '@/lib/answers';

// Browser client (auth comes from the user's session)
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL as string,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Row = {
  type: 'mcq'|'gap'|'match';
  prompt: string;
  options: any | null;
  correct: any | null;
  user_answer: any;
};

export default function ReviewScreen({ slug, attemptId }: { slug: string; attemptId?: string | null }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        let id = attemptId as string | undefined;

        if (!id) {
          const { data: latest, error: e1 } = await supabase
            .from('listening_attempts')
            .select('id')
            .eq('test_slug', slug)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (e1) throw e1;
          id = latest?.id;
        }

        if (!id) {
          if (mounted) { setRows([]); setLoading(false); }
          return;
        }

        const { data, error } = await supabase
          .from('listening_review_items')
          .select('type, prompt, options, correct, user_answer')
          .eq('attempt_id', id);
        if (error) throw error;

        if (mounted) {
          setRows(data as Row[]);
          setLoading(false);
        }
      } catch (e: any) {
        if (mounted) { setErr(e?.message ?? 'Failed to load review'); setLoading(false); }
      }
    })();
    return () => { mounted = false; };
  }, [slug, attemptId]);

  const { questions, answers } = useMemo(() => {
    if (!rows) return { questions: [], answers: [] };
    const qs: any[] = [];
    const ans: any[] = [];
    rows.forEach((r, idx) => {
      const qno = idx + 1;
      if (r.type === 'mcq') {
        const opts = Array.isArray(r.options) ? r.options.map((o: any) => o.label ?? String(o)) : [];
        const correctOpt = Array.isArray(r.options)
          ? r.options.find((o: any) => o.correct)?.label ?? ''
          : '';
        qs.push({ qno, type: 'mcq', prompt: r.prompt, options: opts, answer_key: { value: correctOpt } });
        const user = r.user_answer?.label ?? r.user_answer?.value ?? '';
        ans.push({ qno, answer: user });
      } else if (r.type === 'gap') {
        const correctText = Array.isArray(r.correct) ? r.correct[0] : r.correct;
        qs.push({ qno, type: 'gap', prompt: r.prompt, answer_key: { text: correctText } });
        const user = r.user_answer?.text ?? '';
        ans.push({ qno, answer: user });
      } else {
        const left = r.options?.left ?? [];
        const right = r.options?.right ?? [];
        const pairs = Array.isArray(r.correct) ? r.correct.map((p: any) => [p.left, p.right]) : [];
        const userPairs = (r.user_answer?.pairs ?? []).map((p: any) => [p.left, p.right]);
        qs.push({ qno, type: 'match', match_left: left, match_right: right, answer_key: { pairs } });
        ans.push({ qno, answer: userPairs });
      }
    });
    return { questions: qs, answers: ans };
  }, [rows]);

  const summary = useMemo(() => {
    let total = 0, correct = 0;
    const aMap: Record<number, any> = Object.fromEntries(answers.map((a: any) => [a.qno, a.answer]));
    for (const q of questions) {
      const user = aMap[q.qno];
      if (q.type === 'mcq') {
        total += 1;
        if (isCorrect(user || '', q.answer_key.value)) correct += 1;
      } else if (q.type === 'gap') {
        total += 1;
        if (isCorrect(user || '', q.answer_key.text)) correct += 1;
      } else {
        total += 1;
        const want = q.answer_key.pairs ?? [];
        const got = Array.isArray(user) ? user : [];
        const sort = (arr: any[]) =>
          [...arr].map((p: any) => [Number(p[0]), Number(p[1])]).sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
        if (JSON.stringify(sort(want)) === JSON.stringify(sort(got))) correct += 1;
      }
    }
    const accuracy = total ? (correct / total) * 100 : 0;
    const band = Number(((accuracy / 100) * 9).toFixed(1));
    return { total, correct, accuracy, band };
  }, [questions, answers]);

  if (loading) {
    return (
      <Card className="card-surface p-6 rounded-ds-2xl">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  if (err) {
    return <Alert variant="error" title="Couldn’t load your review">{err}</Alert>;
  }

  if (!questions.length) {
    return (
      <EmptyState
        title="Nothing to review yet"
        description="Finish a Listening test to see your answers and explanations here."
        actionLabel="Back to Listening"
        onAction={() => history.back()}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="card-surface p-6 rounded-ds-2xl lg:col-span-1">
        <h2 className="text-h3 font-semibold mb-3">Your Score</h2>
        <ScoreCard title="Listening Band" overall={summary.band} />
        <div className="mt-4 text-small opacity-80">
          Accuracy: {Math.round(summary.accuracy)}% ({summary.correct} of {summary.total})
        </div>
      </Card>
      <div className="lg:col-span-2">
        {/* ✅ Use AnswerReview directly */}
        <AnswerReview questions={questions} answers={answers} />
      </div>
    </div>
  );
}
