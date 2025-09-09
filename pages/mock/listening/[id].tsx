import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

type QBase = { id: string; prompt?: string; type: 'mcq' | 'gap' | 'map' | 'short'; options?: string[]; answer: string };
type Section = { id: string; title: string; audioUrl?: string; questions: QBase[] };
type ListeningPaper = { id: string; title: string; durationSec: number; transcript?: string; sections: Section[] };

type AnswerMap = Record<string, string>;
type ScoreSummary = { correct: number; total: number; percentage: number };

const DRAFT_KEY = (id: string) => `listen:attempt:${id}`;

const samplePaper: ListeningPaper = {
  id: 'sample-001',
  title: 'Listening Sample 001',
  durationSec: 1800,
  transcript: 'This is a short transcript sample…',
  sections: [
    { id: 'S1', title: 'Section 1', audioUrl: '', questions: [
      { id: 'q1', type: 'mcq', prompt: 'Choose the correct option', options: ['A','B','C','D'], answer: 'B' },
      { id: 'q2', type: 'gap', prompt: 'Fill in the blank', answer: 'library' },
    ]},
    { id: 'S2', title: 'Section 2', audioUrl: '', questions: [
      { id: 'q3', type: 'mcq', prompt: 'Pick one', options: ['Yes','No','Maybe'], answer: 'Yes' },
      { id: 'q4', type: 'short', prompt: 'Write a short answer', answer: '2019' },
    ]},
  ],
};

const loadPaper = async (id: string): Promise<ListeningPaper> => {
  try {
    const mod = await import(`@/data/listening/${id}.json`);
    return mod.default as ListeningPaper;
  } catch {
    return samplePaper;
  }
};

const saveDraft = (id: string, data: { answers: AnswerMap; startedAt: string }) => {
  try { localStorage.setItem(DRAFT_KEY(id), JSON.stringify(data)); } catch {}
};
const loadDraft = (id: string): { answers: AnswerMap; startedAt?: string } | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY(id));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const clearDraft = (id: string) => { try { localStorage.removeItem(DRAFT_KEY(id)); } catch {} };

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

export default function ListeningMockPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [paper, setPaper] = useState<ListeningPaper | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [secIdx, setSecIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(1800);
  const startRef = useRef<string>('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const p = await loadPaper(id);
      setPaper(p);
      setTimeLeft(p.durationSec);
      const draft = loadDraft(id);
      if (draft?.answers) setAnswers(draft.answers);
      startRef.current = draft?.startedAt ?? new Date().toISOString();
      if (!draft) saveDraft(id, { answers: {}, startedAt: startRef.current });
    })();
  }, [id]);

  useEffect(() => {
    if (!id || !paper) return;
    const t = setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [id, paper]);

  useEffect(() => {
    if (!id) return;
    saveDraft(id, { answers, startedAt: startRef.current });
  }, [id, answers]);

  const current = paper?.sections[secIdx];
  const percent = useMemo(() => {
    if (!paper) return 0;
    const total = paper.sections.reduce((acc, s) => acc + s.questions.length, 0);
    const answered = Object.keys(answers).length;
    return Math.round((answered / total) * 100);
  }, [paper, answers]);

  const hhmmss = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return (h > 0 ? `${h}:` : '') + `${m}:${s}`;
  };

  const submit = async () => {
    if (!id || !paper) return;
    const score = computeScore(paper, answers);
    let attemptId = '';
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('Not authenticated');
      const payload = {
        user_id: user.user.id,
        paper_id: paper.id,
        answers,
        score: score.correct,
        total: score.total,
        percentage: score.percentage,
        started_at: startRef.current || new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        duration_sec: paper.durationSec - timeLeft,
      };
      const { data, error } = await supabase.from('attempts_listening').insert(payload).select('id').single();
      if (error) throw error;
      attemptId = data.id as unknown as string;
    } catch {
      // fallback local-only attempt id
      attemptId = `local-${Date.now()}`;
      try { localStorage.setItem(`listen:attempt-res:${attemptId}`, JSON.stringify({ paper, answers })); } catch {}
    } finally {
      clearDraft(id);
      router.replace(`/review/listening/${id}?attempt=${encodeURIComponent(attemptId)}`);
    }
  };

  if (!paper || !current) return <Shell title="Loading…"><div>Loading paper…</div></Shell>;

  return (
    <Shell
      title={`Listening — ${paper.title}`}
      right={
        <>
          <div className="text-sm text-foreground/80">Answered {percent}%</div>
          <div className="rounded-full border border-border px-3 py-1 text-sm">
            ⏱ {hhmmss(timeLeft)}
          </div>
          <Link href="/dashboard" className="text-sm underline underline-offset-4">Save & exit</Link>
        </>
      }
    >
      <div className="grid gap-6">
        {/* Section controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Section {secIdx + 1} of {paper.sections.length} — {current.title}</div>
          <div className="flex gap-2">
            <button disabled={secIdx === 0} onClick={() => setSecIdx((i) => Math.max(0, i - 1))} className="rounded-lg border border-border px-3 py-1 text-sm hover:border-primary">Prev</button>
            <button disabled={secIdx === paper.sections.length - 1} onClick={() => setSecIdx((i) => Math.min(paper.sections.length - 1, i + 1))} className="rounded-lg border border-border px-3 py-1 text-sm hover:border-primary">Next</button>
          </div>
        </div>

        {/* Audio */}
        <div className="rounded-xl border border-border p-3">
          {current.audioUrl ? (
            <audio src={current.audioUrl} controls className="w-full" />
          ) : (
            <div className="text-sm text-foreground/70">No audio URL provided in this sample. (UI is wired for segmented audio if present.)</div>
          )}
        </div>

        {/* Questions */}
        <div className="grid gap-4">
          {current.questions.map((q) => (
            <div key={q.id} className="rounded-xl border border-border p-3">
              <div className="mb-2 text-sm font-medium">{q.prompt || `Question ${q.id}`}</div>
              {q.type === 'mcq' && (
                <div className="flex flex-wrap gap-2">
                  {q.options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className={`rounded-lg border px-3 py-1 text-sm hover:border-primary ${answers[q.id] === opt ? 'border-primary' : 'border-border'}`}
                      type="button"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {q.type !== 'mcq' && (
                <input
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  placeholder="Type your answer"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Link href="/listening" className="text-sm underline underline-offset-4">Change test</Link>
          <button onClick={submit} className="rounded-xl bg-primary px-4 py-2 font-medium text-background hover:opacity-90">Submit for scoring</button>
        </div>
      </div>
    </Shell>
  );
}

function computeScore(paper: ListeningPaper, answers: AnswerMap): ScoreSummary {
  const all = paper.sections.flatMap((s) => s.questions);
  let correct = 0;
  for (const q of all) {
    const given = normalize(answers[q.id] ?? '');
    const key = normalize(q.answer);
    if (given && given === key) correct++;
  }
  return { correct, total: all.length, percentage: Math.round((correct / all.length) * 100) };
}
const normalize = (s: string) => s.trim().toLowerCase();
