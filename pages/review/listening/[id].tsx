import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

type QBase = { id: string; prompt?: string; type: string; options?: string[]; answer: string };
type Section = { id: string; title: string; questions: QBase[] };
type ListeningPaper = { id: string; title: string; transcript?: string; sections: Section[] };

type Attempt = {
  id: string;
  answers: Record<string, string>;
  score: number;
  total: number;
  percentage: number;
  submitted_at: string;
};

const Shell: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-3">{right}</div>
      </header>
      <div className="rounded-2xl border border-border p-4 sm:p-6 bg-background/50 shadow-sm">{children}</div>
    </div>
  </div>
);

const loadPaper = async (id: string): Promise<ListeningPaper> => {
  try {
    const mod = await import(`@/data/listening/${id}.json`);
    return mod.default as ListeningPaper;
  } catch {
    // minimal fallback structure, aligns with mock page fallback
    return {
      id: 'sample-001',
      title: 'Listening Sample 001',
      transcript: 'This is a short transcript sample…',
      sections: [
        { id: 'S1', title: 'Section 1', questions: [
          { id: 'q1', type: 'mcq', prompt: 'Choose the correct option', options: ['A','B','C','D'], answer: 'B' },
          { id: 'q2', type: 'gap', prompt: 'Fill in the blank', answer: 'library' },
        ]},
        { id: 'S2', title: 'Section 2', questions: [
          { id: 'q3', type: 'mcq', prompt: 'Pick one', options: ['Yes','No','Maybe'], answer: 'Yes' },
          { id: 'q4', type: 'short', prompt: 'Write a short answer', answer: '2019' },
        ]},
      ],
    };
  }
};

export default function ListeningReviewPage() {
  const router = useRouter();
  const { id, attempt } = router.query as { id?: string; attempt?: string };
  const [paper, setPaper] = useState<ListeningPaper | null>(null);
  const [att, setAtt] = useState<Attempt | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => setPaper(await loadPaper(id)))();
  }, [id]);

  useEffect(() => {
    if (!attempt) return;
    (async () => {
      try {
        const { data } = await supabase.from('attempts_listening').select('*').eq('id', attempt).single();
        if (data) { setAtt(data as Attempt); return; }
      } catch {}
      try {
        const raw = localStorage.getItem(`listen:attempt-res:${attempt}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const answers = parsed.answers || {};
          const allQs: QBase[] = (parsed.paper?.sections ?? []).flatMap((s: any) => s.questions);
          const total = allQs.length;
          let score = 0;
          for (const q of allQs) if ((answers[q.id] ?? '').trim().toLowerCase() === (q.answer ?? '').trim().toLowerCase()) score++;
          setAtt({
            id: attempt,
            answers,
            score,
            total,
            percentage: Math.round((score / (total || 1)) * 100),
            submitted_at: new Date().toISOString(),
          });
        }
      } catch {}
    })();
  }, [attempt]);

  const flatQs = useMemo(() => paper?.sections.flatMap((s) => s.questions) ?? [], [paper]);

  if (!paper || !att) return <Shell title="Review — Loading…"><div>Loading review…</div></Shell>;

  return (
    <Shell
      title={`Review — ${paper.title}`}
      right={
        <div className="rounded-full border border-border px-3 py-1 text-sm">
          Score: {att.score}/{att.total} ({att.percentage}%)
        </div>
      }
    >
      <div className="grid gap-6">
        {/* Answers diff */}
        <div>
          <h2 className="mb-2 text-base font-semibold">Answer check</h2>
          <div className="grid gap-3">
            {flatQs.map((q, idx) => {
              const given = (att.answers?.[q.id] ?? '').trim();
              const key = (q.answer ?? '').trim();
              const ok = given.toLowerCase() === key.toLowerCase();
              return (
                <div key={q.id} className="rounded-lg border border-border p-3">
                  <div className="mb-1 text-sm text-foreground/80">Q{idx + 1}. {q.prompt || q.id}</div>
                  <div className="text-sm">
                    <span className={`rounded px-2 py-0.5 text-background ${ok ? 'bg-primary' : 'bg-border'}`}>{ok ? 'Correct' : 'Wrong'}</span>
                    <span className="ml-3">Your answer: <strong>{given || '—'}</strong></span>
                    {!ok && <span className="ml-3">Correct: <strong>{key}</strong></span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transcript */}
        {paper.transcript && (
          <div className="rounded-xl border border-border p-4">
            <h2 className="mb-2 text-base font-semibold">Transcript</h2>
            <p className="whitespace-pre-wrap text-sm text-foreground/80">{paper.transcript}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link href="/listening" className="text-sm underline underline-offset-4">Try another test</Link>
          <Link href="/dashboard" className="rounded-xl border border-border px-4 py-2 hover:border-primary">Go to dashboard</Link>
        </div>
      </div>
    </Shell>
  );
}
