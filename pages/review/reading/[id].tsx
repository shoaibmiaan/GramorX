import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

type QType = 'tfng' | 'yynn' | 'heading' | 'match' | 'mcq' | 'gap';
type Q = { id: string; type: QType; prompt?: string; options?: string[]; answer: string; explanation?: string };
type Passage = { id: string; title: string; text: string; questions: Q[] };
type ReadingPaper = { id: string; title: string; passages: Passage[] };

type Attempt = { id: string; answers: Record<string, string>; score: number; total: number; percentage: number; submitted_at: string };

const loadPaper = async (id: string): Promise<ReadingPaper> => {
  try { const mod = await import(`@/data/reading/${id}.json`); return mod.default as ReadingPaper; } catch {
    return {
      id: 'sample-001',
      title: 'Reading Sample 001',
      passages: [
        { id: 'P1', title: 'The Honeybee', text: 'Bees are fascinating…', questions: [
          { id: 'q1', type: 'tfng', prompt: 'Bees can see UV light.', answer: 'True', explanation: 'Bees have UV vision.' },
          { id: 'q2', type: 'yynn', prompt: 'Honey is spicy.', answer: 'No', explanation: 'Honey is sweet.' },
          { id: 'q3', type: 'heading', prompt: 'Choose paragraph heading', options: ['Origins','Vision','Diet'], answer: 'Vision', explanation: 'The paragraph describes visual capability.' },
        ]},
        { id: 'P2', title: 'Ancient Roads', text: 'Roads enabled trade…', questions: [
          { id: 'q4', type: 'match', prompt: 'Match A with B', options: ['Roman','Silk','Inca'], answer: 'Roman', explanation: 'Describes Roman roads.' },
          { id: 'q5', type: 'mcq', prompt: 'Pick one', options: ['A','B','C'], answer: 'C', explanation: 'Option C aligns with text.' },
        ]},
      ],
    };
  }
};

const Shell: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-3">{right}</div>
      </header>
      <div className="grid gap-6">{children}</div>
    </div>
  </div>
);

export default function ReadingReviewPage() {
  const router = useRouter();
  const { id, attempt } = router.query as { id?: string; attempt?: string };

  const [paper, setPaper] = useState<ReadingPaper | null>(null);
  const [att, setAtt] = useState<Attempt | null>(null);

  useEffect(() => { if (!id) return; (async () => setPaper(await loadPaper(id)))(); }, [id]);
  useEffect(() => {
    if (!attempt) return;
    (async () => {
      try {
        const { data } = await supabase.from('attempts_reading').select('*').eq('id', attempt).single();
        if (data) { setAtt(data as Attempt); return; }
      } catch {}
      try {
        const raw = localStorage.getItem(`read:attempt-res:${attempt}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const answers = parsed.answers || {};
          const flat: Q[] = (parsed.paper?.passages ?? []).flatMap((p: any) => p.questions);
          const total = flat.length; let score = 0;
          for (const q of flat) if ((answers[q.id] ?? '').trim().toLowerCase() === (q.answer ?? '').trim().toLowerCase()) score++;
          setAtt({ id: attempt, answers, score, total, percentage: Math.round((score/(total||1))*100), submitted_at: new Date().toISOString() });
        }
      } catch {}
    })();
  }, [attempt]);

  const flatQs = useMemo(() => paper?.passages.flatMap((p) => p.questions) ?? [], [paper]);

  const statsByType = useMemo(() => {
    if (!paper || !att) return [];
    const map: Record<string, { correct: number; total: number }> = {};
    for (const q of flatQs) {
      const key = q.type;
      map[key] ??= { correct: 0, total: 0 };
      map[key].total++;
      const ok = (att.answers?.[q.id] ?? '').trim().toLowerCase() === (q.answer ?? '').trim().toLowerCase();
      if (ok) map[key].correct++;
    }
    return Object.entries(map).map(([type, { correct, total }]) => ({ type, correct, total, pct: Math.round((correct / total) * 100) }));
  }, [paper, att, flatQs]);

  if (!paper || !att) return <Shell title="Review — Loading…"><div className="rounded-2xl border border-border p-4">Loading…</div></Shell>;

  return (
    <Shell
      title={`Review — ${paper.title}`}
      right={<div className="rounded-full border border-border px-3 py-1 text-sm">Score: {att.score}/{att.total} ({att.percentage}%)</div>}
    >
      <section className="rounded-2xl border border-border p-4">
        <h2 className="mb-2 text-base font-semibold">Performance by question type</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {statsByType.map((s) => (
            <div key={s.type} className="rounded-lg border border-border p-3 text-sm">
              <div className="font-medium">{labelType(s.type)}</div>
              <div className="text-foreground/80">{s.correct}/{s.total} correct • {s.pct}%</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border p-4">
        <h2 className="mb-2 text-base font-semibold">Answers & explanations</h2>
        <div className="grid gap-3">
          {flatQs.map((q, idx) => {
            const given = (att.answers?.[q.id] ?? '').trim();
            const ok = given.toLowerCase() === (q.answer ?? '').trim().toLowerCase();
            return (
              <div key={q.id} className="rounded-lg border border-border p-3">
                <div className="mb-1 text-sm text-foreground/80">Q{idx + 1}. {q.prompt || q.id}</div>
                <div className="text-sm">
                  <span className={`rounded px-2 py-0.5 text-background ${ok ? 'bg-primary' : 'bg-border'}`}>{ok ? 'Correct' : 'Wrong'}</span>
                  <span className="ml-3">Your answer: <strong>{given || '—'}</strong></span>
                  {!ok && <span className="ml-3">Correct: <strong>{q.answer}</strong></span>}
                </div>
                {q.explanation && <p className="mt-2 text-sm text-foreground/80">{q.explanation}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <Link href="/reading" className="text-sm underline underline-offset-4">Try another reading</Link>
        <Link href="/dashboard" className="rounded-xl border border-border px-4 py-2 hover:border-primary">Go to dashboard</Link>
      </div>
    </Shell>
  );
}
const labelType = (t: string) => t === 'tfng' ? 'True/False/Not Given' : t === 'yynn' ? 'Yes/No/Not Given' : t === 'heading' ? 'Headings' : t === 'match' ? 'Matching' : t === 'mcq' ? 'Multiple Choice' : 'Gap Fill';
