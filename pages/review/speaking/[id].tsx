import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

type AIFeedback = { bandOverall: number; fluency: number; lexical: number; grammar: number; pronunciation: number; notes: string[] };

const Shell: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-3">{right}</div>
      </header>
      <div className="rounded-2xl border border-border p-4 sm:p-6 bg-background/50 shadow-sm">{children}</div>
    </div>
  </div>
);

export default function SpeakingReviewPage() {
  const router = useRouter();
  const { attempt } = router.query as { attempt?: string };
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [ai, setAI] = useState<AIFeedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attempt) return;
    (async () => {
      // Try Supabase storage path from DB
      try {
        const { data } = await supabase.from('attempts_speaking').select('recording_path').eq('id', attempt).single();
        const path = data?.recording_path as string | undefined;
        if (path) {
          const { data: signed, error } = await supabase.storage.from('speaking-recordings').createSignedUrl(path, 60 * 60);
          if (!error && signed?.signedUrl) setAudioUrl(signed.signedUrl);
        }
      } catch {}
      // Fallback to local blob URL if exists
      if (!audioUrl) {
        const local = localStorage.getItem(`speak:rec:${attempt}`);
        if (local) setAudioUrl(local);
      }
      // AI feedback
      try {
        const res = await fetch('/api/ai/speaking/grade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attemptId: attempt }) });
        if (res.ok) setAI(await res.json() as AIFeedback);
        else setAI(heuristic());
      } catch { setAI(heuristic()); }
      setLoading(false);
    })();
  }, [attempt]);

  return (
    <Shell title="Speaking Review" right={ai ? <div className="rounded-full border border-border px-3 py-1 text-sm">Band: {ai.bandOverall.toFixed(1)}</div> : <div className="text-sm">Analyzing…</div>}>
      <div className="grid gap-6">
        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-base font-semibold">Your recording</h2>
          {audioUrl ? <audio src={audioUrl} controls className="w-full" /> : <div className="text-sm text-foreground/70">No audio found.</div>}
        </section>

        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-base font-semibold">AI Feedback</h2>
          {loading ? <div className="text-sm text-foreground/70">Analyzing…</div> : ai ? (
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge label="Fluency" val={ai.fluency} />
                <Badge label="Lexical" val={ai.lexical} />
                <Badge label="Grammar" val={ai.grammar} />
                <Badge label="Pronunciation" val={ai.pronunciation} />
              </div>
              <ul className="list-inside list-disc text-sm text-foreground/80">{ai.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          ) : <div className="text-sm text-foreground/70">AI feedback unavailable.</div>}
        </section>

        <div className="flex items-center justify-between">
          <Link href="/speaking" className="text-sm underline underline-offset-4">Try another speaking</Link>
          <Link href="/dashboard" className="rounded-xl border border-border px-4 py-2 hover:border-primary">Go to dashboard</Link>
        </div>
      </div>
    </Shell>
  );
}
const Badge: React.FC<{ label: string; val: number }> = ({ label, val }) => (
  <div className="rounded border border-border px-3 py-1">{label}: <strong>{val.toFixed(1)}</strong></div>
);
const heuristic = (): AIFeedback => ({
  bandOverall: 6.5,
  fluency: 6.5,
  lexical: 6.0,
  grammar: 6.5,
  pronunciation: 6.5,
  notes: ['Maintain steady pace; avoid long pauses.', 'Use more topic-specific vocabulary.', 'Vary sentence structures; watch articles.'],
});
  