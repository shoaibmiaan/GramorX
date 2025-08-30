import React, { useState } from 'react';
import type { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';

interface Criteria { task: number; coherence: number; lexical: number; grammar: number }
interface Attempt {
  id: string;
  user_id?: string;
  task_type: 'T1'|'T2'|'GT';
  prompt: string;
  essay_text: string;
  band_overall: number;
  band_breakdown: Criteria;
  feedback: string;
}

export const getServerSideProps: GetServerSideProps<{ attempt: Attempt }> = async (ctx) => {
  const supa = createServerSupabaseClient(ctx);
  const { data: auth } = await supa.auth.getUser();
  const userId = auth.user?.id ?? null;
  const id = String(ctx.params!.id);
  const { data: attempt, error } = await supa
    .from('writing_attempts')
    .select('id, user_id, task_type, prompt, essay_text, band_overall, band_breakdown, feedback')
    .eq('id', id)
    .single();
  if (error || !attempt) return { notFound: true };
  if (attempt.user_id && attempt.user_id !== userId) return { notFound: true };
  return { props: { attempt } };
};

export default function WritingReview({ attempt }: { attempt: Attempt }) {
  const [result, setResult] = useState<{ band_overall:number; band_breakdown:Criteria; feedback:string; model:string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const delta = (a:number,b:number) => Math.round((a-b)*10)/10;

  const reeval = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await fetch('/api/ai/re-evaluate', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ attemptId: attempt.id }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Request failed');
      }
      const data = await res.json();
      setResult(data);
    } catch (e:any) {
      setErr(e.message);
    } finally {
      setLoading(false);
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
            <Card className="card-surface p-6 rounded-ds-2xl">
              <h3 className="text-h3">AI Re-evaluation</h3>
              <p className="text-grayish mt-1">Run a second pass and compare scores.</p>
              <Button onClick={reeval} disabled={loading} variant="primary" className="mt-4 rounded-ds-xl">
                {loading ? 'Re-evaluating…' : 'Re-evaluate'}
              </Button>
              {err && <Alert variant="error" title="Failed" className="mt-4">{err}</Alert>}
              {result && (
                <div className="mt-6 grid gap-4">
                  <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <Badge variant="neutral" size="sm">Original: {attempt.band_overall}</Badge>
                      <Badge
                        variant={result.band_overall>attempt.band_overall?'success':result.band_overall<attempt.band_overall?'danger':'neutral'}
                        size="sm"
                      >
                        New: {result.band_overall} ({delta(result.band_overall, attempt.band_overall)>0?'+':''}{delta(result.band_overall, attempt.band_overall)})
                      </Badge>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {(['task','coherence','lexical','grammar'] as const).map(k => (
                      <div key={k} className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{k}</span>
                          <Badge
                            variant={result.band_breakdown[k]>attempt.band_breakdown[k]?'success':result.band_breakdown[k]<attempt.band_breakdown[k]?'danger':'neutral'}
                            size="sm"
                          >
                            {attempt.band_breakdown[k]} → {result.band_breakdown[k]} ({delta(result.band_breakdown[k], attempt.band_breakdown[k])>0?'+':''}{delta(result.band_breakdown[k], attempt.band_breakdown[k])})
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Alert variant="info" title="Feedback">{result.feedback}</Alert>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
