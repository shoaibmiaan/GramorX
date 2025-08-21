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

// Define ReviewQ type locally since AnswerReview doesn’t export it
type ReviewQ =
  | { type: 'mcq'; prompt: string; userAnswer: string; options: any[] }
  | { type: 'gap'; prompt: string; userAnswer: string; correct: any[] }
  | { type: 'match'; prompt: string; pairs: { left: any; user: any; correct: any }[] };

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

  // Map DB rows → ReviewQ[]
  const items: ReviewQ[] = useMemo(() => {
    if (!rows) return [];
    return rows.map((r) => {
      if (r.type === 'mcq') {
        return {
          type: 'mcq',
          prompt: r.prompt,
          userAnswer: r.user_answer?.label ?? '',
          options: Array.isArray(r.options) ? r.options : [],
        } as ReviewQ;
      }
      if (r.type === 'gap') {
        return {
          type: 'gap',
          prompt: r.prompt,
          userAnswer: r.user_answer?.text ?? '',
          correct: Array.isArray(r.correct) ? r.correct : [r.correct].filter(Boolean),
        } as ReviewQ;
      }
      const qPairs = Array.isArray(r.correct) ? r.correct : [];
      const uPairs = r.user_answer?.pairs ?? [];
      const merged = qPairs.map((qp: any) => {
        const u = uPairs.find((x: any) => x.left === qp.left);
        return { left: qp.left, user: u?.user ?? null, correct: qp.right };
      });
      return { type: 'match', prompt: r.prompt, pairs: merged } as ReviewQ;
    });
  }, [rows]);

  // Compute summary
  const summary = useMemo(() => {
    let total = 0, correct = 0;
    for (const q of items) {
      if (q.type === 'mcq') {
        total += 1;
        const ans = q.options.find((o:any)=>o.correct)?.label ?? '';
        if (isCorrect((q as any).userAnswer || '', ans)) correct += 1;
      } else if (q.type === 'gap') {
        total += 1;
        if (isCorrect((q as any).userAnswer || '', (q as any).correct)) correct += 1;
      } else {
        for (const p of q.pairs) { total += 1; if (p.user === p.correct) correct += 1; }
      }
    }
    const accuracy = total ? (correct / total) * 100 : 0;
    const band = Number(((accuracy / 100) * 9).toFixed(1));
    return { total, correct, accuracy, band };
  }, [items]);

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

  if (!items.length) {
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
        <AnswerReview questions={[]} answers={[]} />
      </div>
    </div>
  );
}
