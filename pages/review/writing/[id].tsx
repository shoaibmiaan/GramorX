import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

type AIFeedback = {
  bandOverall: number;
  criteria: { taskAchievement: number; coherence: number; lexical: number; grammar: number };
  notes: string[];
};
type Attempt = { id: string; task1: string; task2: string; wordcount1: number; wordcount2: number; submitted_at: string; ai_feedback?: AIFeedback | null };

const Shell: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-3">{right}</div>
      </header>
      <div className="rounded-2xl border border-border p-4 sm:p-6 bg-background/50 shadow-sm">{children}</div>
    </div>
  </div>
);

export default function WritingReviewPage() {
  const router = useRouter();
  const { attempt } = router.query as { attempt?: string };
  const [att, setAtt] = useState<Attempt | null>(null);
  const [ai, setAI] = useState<AIFeedback | null>(null);
  const [loadingAI, setLoadingAI] = useState(true);

  useEffect(() => {
    if (!attempt) return;
    (async () => {
      // Load attempt
      try {
        const { data } = await supabase.from('attempts_writing').select('*').eq('id', attempt).single();
        if (data) setAtt(data as Attempt);
      } catch {
        // local fallback
        try {
          const raw = localStorage.getItem(`write:attempt-res:${attempt}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            setAtt({ id: attempt, task1: parsed.task1, task2: parsed.task2, wordcount1: parsed.task1?.split(/\s+/).length ?? 0, wordcount2: parsed.task2?.split(/\s+/).length ?? 0, submitted_at: new Date().toISOString(), ai_feedback: null });
          }
        } catch {}
      }
    })();
  }, [attempt]);

  useEffect(() => {
    if (!att) return;
    (async () => {
      setLoadingAI(true);
      try {
        const res = await fetch('/api/ai/writing/grade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task1: att.task1, task2: att.task2 }) });
        if (res.ok) {
          const data = await res.json();
          setAI(data as AIFeedback);
        } else {
          setAI(heuristic(att.task1, att.task2));
        }
      } catch {
        setAI(heuristic(att.task1, att.task2));
      } finally {
        setLoadingAI(false);
      }
    })();
  }, [att]);

  if (!att) return <Shell title="Writing Review"><div>Loading attempt…</div></Shell>;

  return (
    <Shell
      title="Writing Review"
      right={!loadingAI && ai ? <div className="rounded-full border border-border px-3 py-1 text-sm">Band (AI): {ai.bandOverall.toFixed(1)}</div> : <div className="text-sm">Getting AI feedback…</div>}
    >
      <div className="grid gap-6">
        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-base font-semibold">Task 1</h2>
          <div className="mb-2 text-xs text-foreground/70">Words: {att.wordcount1}</div>
          <p className="whitespace-pre-wrap text-sm">{att.task1}</p>
        </section>

        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-base font-semibold">Task 2</h2>
          <div className="mb-2 text-xs text-foreground/70">Words: {att.wordcount2}</div>
          <p className="whitespace-pre-wrap text-sm">{att.task2}</p>
        </section>

        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-base font-semibold">AI Feedback</h2>
          {loadingAI ? (
            <div className="text-sm text-foreground/70">Analyzing…</div>
          ) : ai ? (
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge label="Task Achievement" val={ai.criteria.taskAchievement} />
                <Badge label="Coherence & Cohesion" val={ai.criteria.coherence} />
                <Badge label="Lexical Resource" val={ai.criteria.lexical} />
                <Badge label="Grammar & Accuracy" val={ai.criteria.grammar} />
              </div>
              <ul className="list-inside list-disc text-sm text-foreground/80">
                {ai.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-foreground/70">AI feedback unavailable.</div>
          )}
        </section>

        <div className="flex items-center justify-between">
          <Link href="/writing" className="text-sm underline underline-offset-4">Try another writing</Link>
          <Link href="/dashboard" className="rounded-xl border border-border px-4 py-2 hover:border-primary">Go to dashboard</Link>
        </div>
      </div>
    </Shell>
  );
}
const Badge: React.FC<{ label: string; val: number }> = ({ label, val }) => (
  <div className="rounded border border-border px-3 py-1">{label}: <strong>{val.toFixed(1)}</strong></div>
);
function heuristic(t1: string, t2: string): AIFeedback {
  const wc = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
  const w1 = wc(t1), w2 = wc(t2);
  const base = 5.5 + Math.min(1.0, Math.max(0, (w1 - 150) / 300)) + Math.min(1.5, Math.max(0, (w2 - 250) / 500));
  const band = Math.max(4, Math.min(9, Math.round(base * 2) / 2));
  return {
    bandOverall: band,
    criteria: {
      taskAchievement: Math.min(9, Math.max(4, 5 + (w1 > 150 ? 1 : 0) + (w2 > 250 ? 1 : 0))),
      coherence: Math.min(9, Math.max(4, 5.5)),
      lexical: Math.min(9, Math.max(4, 5.5)),
      grammar: Math.min(9, Math.max(4, 5.5)),
    },
    notes: [
      'Ensure clear topic sentences and logical paragraphing.',
      'Use a wider range of cohesive devices (however, furthermore, consequently).',
      'Aim for precise vocabulary and avoid repetition.',
      'Check complex sentences for agreement and punctuation.',
    ],
  };
}
