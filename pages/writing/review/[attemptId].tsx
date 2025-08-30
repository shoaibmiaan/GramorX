// pages/writing/review/[attemptId].tsx
import React, { useState } from 'react';
import type { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import ChallengeScore from '@/components/review/ChallengeScore';
import { ReevalPanel } from '@/components/writing/ReevalPanel';
import { ReevalHistory, type ReevalRow } from '@/components/writing/ReevalHistory';
import { useToast } from '@/components/design-system/Toaster';

type Criteria = { task:number; coherence:number; lexical:number; grammar:number };
type Attempt = {
  id: string;
  task_type: 'T1'|'T2'|'GT';
  prompt: string;
  essay_text: string;
  band_overall: number;
  band_breakdown: Criteria;
  feedback: string;
};

type Props = { attempt: Attempt; reevals: ReevalRow[]; isAdmin: boolean };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const supa = createServerSupabaseClient(ctx);
  const { data: auth } = await supa.auth.getUser();
  const userId = auth.user?.id ?? null;

  // attempt
  const id = String(ctx.params!.attemptId);
  const { data: attempt, error: e1 } = await supa
    .from('writing_attempts')
    .select('id, task_type, prompt, essay_text, band_overall, band_breakdown, feedback')
    .eq('id', id).single();
  if (e1 || !attempt) return { notFound: true };

  // reevals
  const { data: reevals } = await supa
    .from('writing_reevals')
    .select('id, created_at, mode, focus, band_overall, band_breakdown, feedback, model')
    .eq('attempt_id', id)
    .order('created_at', { ascending: false });

  // admin?
  let isAdmin = false;
  if (userId) {
    const { data: p } = await supa.from('profiles').select('is_admin').eq('id', userId).single();
    isAdmin = !!p?.is_admin;
  }

  return { props: { attempt, reevals: reevals ?? [], isAdmin } };
};

export default function WritingReview({ attempt: initialAttempt, reevals, isAdmin }: Props) {
  const [attempt, setAttempt] = useState(initialAttempt);
  const [history, setHistory] = useState<ReevalRow[]>(reevals);
  const { success, error: toastError } = useToast();

  const onRestore = async (row: ReevalRow) => {
    const res = await fetch('/api/writing/restore-reeval', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ reevalId: row.id })
    });
    if (res.ok) {
      // update the on-screen attempt to reflect restored scores
      setAttempt(a => ({
        ...a,
        band_overall: row.band_overall,
        band_breakdown: row.band_breakdown,
        feedback: row.feedback || a.feedback
      }));
      success('Restored successfully');
    } else {
      const { error } = await res.json();
      toastError(error || 'Restore failed');
    }
  };

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-h1 md:text-display">Writing Review</h1>
        <p className="text-grayish mt-1">Task {attempt.task_type}</p>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] mt-6">
          <Card className="card-surface p-6 rounded-ds-2xl">
            <h3 className="text-h3">Scores</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="success" size="md">Overall: {attempt.band_overall}</Badge>
              <Badge variant="info" size="sm">Task: {attempt.band_breakdown.task}</Badge>
              <Badge variant="info" size="sm">Coherence: {attempt.band_breakdown.coherence}</Badge>
              <Badge variant="info" size="sm">Lexical: {attempt.band_breakdown.lexical}</Badge>
              <Badge variant="info" size="sm">Grammar: {attempt.band_breakdown.grammar}</Badge>
            </div>

            <ChallengeScore attemptId={attempt.id} type="writing" />

            <h3 className="text-h3 mt-6">Model Answer (Reference)</h3>
            <div className="prose dark:prose-invert max-w-none mt-2">
              <p>{attempt.feedback || 'Model answer and comments will appear here.'}</p>
            </div>

            <h3 className="text-h3 mt-6">Your Essay</h3>
            <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10 whitespace-pre-wrap">
              {attempt.essay_text}
            </div>
          </Card>

          <div className="grid gap-6">
            <ReevalPanel
              attemptId={attempt.id}
              original={{ bandOverall: attempt.band_overall, criteria: attempt.band_breakdown }}
              onSaved={(row) => setHistory(h => [{
                id: row.id, created_at: row.created_at, mode: row.mode as any, focus: row.focus,
                band_overall: row.band_overall, band_breakdown: row.band_breakdown,
                feedback: row.feedback, model: 'reeval'
              }, ...h])}
            />
            <ReevalHistory
              originalOverall={attempt.band_overall}
              items={history}
              canRestore={isAdmin}
              onRestore={onRestore}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
