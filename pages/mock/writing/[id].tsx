import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

type WritingPaper = {
  id: string;
  title: string;
  task1Prompt: string;
  task2Prompt: string;
  minWordsTask1: number;
  minWordsTask2: number;
  durationSec: number;
};

const DRAFT_KEY = (id: string) => `write:attempt:${id}`;

const sampleWriting: WritingPaper = {
  id: 'sample-001',
  title: 'Writing Sample 001',
  task1Prompt: 'Summarize the information presented in the chart in at least 150 words.',
  task2Prompt: 'Some people think technology makes life more complex. Others think it makes life easier. Discuss both views and give your opinion. (250+ words)',
  minWordsTask1: 150,
  minWordsTask2: 250,
  durationSec: 3600,
};

const loadPaper = async (id: string): Promise<WritingPaper> => {
  try { const mod = await import(`@/data/writing/${id}.json`); return mod.default as WritingPaper; } catch { return sampleWriting; }
};

const Shell: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
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

export default function WritingMockPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [paper, setPaper] = useState<WritingPaper | null>(null);
  const [task1, setTask1] = useState('');
  const [task2, setTask2] = useState('');
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => { if (!id) return; (async () => {
    const p = await loadPaper(id);
    setPaper(p);
    setTimeLeft(p.durationSec);
    const dr = loadDraft(id);
    if (dr) { setTask1(dr.task1 || ''); setTask2(dr.task2 || ''); }
    if (!dr) saveDraft(id, { task1: '', task2: '' });
  })(); }, [id]);

  useEffect(() => { if (!paper) return; const t = setInterval(() => setTimeLeft((x) => (x>0?x-1:0)), 1000); return () => clearInterval(t); }, [paper]);
  useEffect(() => { if (!id) return; saveDraft(id, { task1, task2 }); }, [id, task1, task2]);

  const wc1 = countWords(task1);
  const wc2 = countWords(task2);
  const ok = useMemo(() => {
    if (!paper) return false;
    return wc1 >= paper.minWordsTask1 && wc2 >= paper.minWordsTask2;
  }, [paper, wc1, wc2]);

  const submit = async () => {
    if (!paper || !id) return;
    let attemptId = '';
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user?.id) throw new Error('Not authenticated');
      const payload = { user_id: u.user.id, paper_id: paper.id, task1, task2, wordcount1: wc1, wordcount2: wc2, submitted_at: new Date().toISOString(), duration_sec: paper.durationSec - timeLeft };
      const { data, error } = await supabase.from('attempts_writing').insert(payload).select('id').single();
      if (error) throw error;
      attemptId = data.id as unknown as string;
    } catch {
      attemptId = `local-${Date.now()}`;
      try { localStorage.setItem(`write:attempt-res:${attemptId}`, JSON.stringify({ paper, task1, task2 })); } catch {}
    } finally {
      clearDraft(id);
      router.replace(`/review/writing/${id}?attempt=${attemptId}`);
    }
  };

  if (!paper) return <Shell title="Loading…"><div>Loading…</div></Shell>;

  return (
    <Shell
      title={`Writing — ${paper.title}`}
      right={<div className="rounded-full border border-border px-3 py-1 text-sm">⏱ {hhmmss(timeLeft)}</div>}
    >
      <div className="grid gap-6">
        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-base font-semibold">Task 1</h2>
          <p className="mb-2 text-sm text-foreground/80">{paper.task1Prompt}</p>
          <textarea value={task1} onChange={(e) => setTask1(e.target.value)} className="h-40 w-full rounded-lg border border-border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="mt-1 text-xs text-foreground/70">Words: {wc1} (min {paper.minWordsTask1})</div>
        </section>

        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-base font-semibold">Task 2</h2>
          <p className="mb-2 text-sm text-foreground/80">{paper.task2Prompt}</p>
          <textarea value={task2} onChange={(e) => setTask2(e.target.value)} className="h-60 w-full rounded-lg border border-border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="mt-1 text-xs text-foreground/70">Words: {wc2} (min {paper.minWordsTask2})</div>
        </section>

        <div className="flex items-center justify-between">
          <Link href="/writing" className="text-sm underline underline-offset-4">Change test</Link>
          <button onClick={submit} disabled={!ok} className={`rounded-xl px-4 py-2 font-medium text-background ${ok ? 'bg-primary hover:opacity-90' : 'bg-border cursor-not-allowed'}`}>Submit for AI grading</button>
        </div>
      </div>
    </Shell>
  );
}
const saveDraft = (id: string, data: any) => { try { localStorage.setItem(DRAFT_KEY(id), JSON.stringify(data)); } catch {} };
const loadDraft = (id: string) => { try { const raw = localStorage.getItem(DRAFT_KEY(id)); return raw ? JSON.parse(raw) : null; } catch { return null; } };
const clearDraft = (id: string) => { try { localStorage.removeItem(DRAFT_KEY(id)); } catch {} };
const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const hhmmss = (sec: number) => `${Math.floor(sec/60).toString().padStart(2,'0')}:${Math.floor(sec%60).toString().padStart(2,'0')}`;
