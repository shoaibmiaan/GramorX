import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

type SpeakingScript = {
  id: string;
  title: string;
  part1: string[]; // short questions
  part2: { cueCard: string[]; prepSec: number; speakSec: number };
  part3: string[]; // follow-ups
};

const sampleScript: SpeakingScript = {
  id: 'sample-001',
  title: 'Hobbies & Learning',
  part1: ['What do you do in your free time?', 'Do you prefer indoor or outdoor activities?', 'How often do you meet friends?'],
  part2: {
    cueCard: [
      'Describe a skill you would like to learn.',
      'You should say:',
      '• what it is',
      '• why you want to learn it',
      '• how you would learn it',
      'and explain how this skill would help you in the future.',
    ],
    prepSec: 60, speakSec: 120,
  },
  part3: ['Do you think adults should continue learning?', 'How does technology help people learn?'],
};

const loadScript = async (id: string): Promise<SpeakingScript> => {
  try { const mod = await import(`@/data/speaking/${id}.json`); return mod.default as SpeakingScript; } catch { return sampleScript; }
};

const Shell: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
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

export default function SpeakingMockPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [script, setScript] = useState<SpeakingScript | null>(null);
  const [stage, setStage] = useState<'p1' | 'p2prep' | 'p2talk' | 'p3' | 'done'>('p1');
  const [timer, setTimer] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [attemptId, setAttemptId] = useState<string>('');

  useEffect(() => { if (!id) return; (async () => setScript(await loadScript(id)))(); }, [id]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) interval = setInterval(() => setTimer((x) => x - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const startRec = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        chunks.current = [];
        await saveAttempt(blob);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch { /* mic denied */ }
  };
  const stopRec = () => { mediaRef.current?.stop(); setRecording(false); };

  const proceed = () => {
    if (!script) return;
    if (stage === 'p1') { setStage('p2prep'); setTimer(script.part2.prepSec); }
    else if (stage === 'p2prep') { setStage('p2talk'); setTimer(script.part2.speakSec); }
    else if (stage === 'p2talk') { setStage('p3'); setTimer(90); }
    else if (stage === 'p3') { setStage('done'); stopRec(); }
  };

  const begin = async () => {
    await startRec();
    setStage('p1'); setTimer(90);
  };

  const saveAttempt = async (blob: Blob) => {
    let idOut = '';
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user?.id) throw new Error('Not authenticated');
      const { data: att, error } = await supabase.from('attempts_speaking').insert({ user_id: u.user.id, script_id: script?.id ?? id, created_at: new Date().toISOString() }).select('id').single();
      if (error) throw error;
      idOut = att.id as unknown as string;
      const path = `${u.user.id}/${idOut}.webm`;
      const { error: errUp } = await supabase.storage.from('speaking-recordings').upload(path, blob, { contentType: 'audio/webm', upsert: true });
      if (errUp) throw errUp;
      await supabase.from('attempts_speaking').update({ recording_path: path }).eq('id', idOut);
    } catch {
      idOut = `local-${Date.now()}`;
      try { const url = URL.createObjectURL(blob); localStorage.setItem(`speak:rec:${idOut}`, url); } catch {}
    } finally {
      setAttemptId(idOut);
    }
  };

  if (!script) return <Shell title="Loading speaking…"><div>Loading…</div></Shell>;
  if (stage === 'done') return (
    <Shell title="Speaking — Finished">
      <div className="grid gap-4">
        <div className="text-sm">Your attempt has been saved.</div>
        <div className="flex items-center justify-between">
          <Link href="/speaking" className="text-sm underline underline-offset-4">Try another script</Link>
          <Link href={`/review/speaking/${script.id}?attempt=${attemptId}`} className="rounded-xl border border-border px-4 py-2 hover:border-primary">Go to review</Link>
        </div>
      </div>
    </Shell>
  );

  return (
    <Shell title={`Speaking — ${script.title}`} right={<div className="rounded-full border border-border px-3 py-1 text-sm">⏱ {timer}s</div>}>
      <div className="grid gap-6">
        {stage === 'p1' && (
          <section className="rounded-xl border border-border p-4">
            <h2 className="mb-2 text-base font-semibold">Part 1 — Introduction & Interview</h2>
            <ul className="list-disc list-inside text-sm text-foreground/80">{script.part1.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </section>
        )}
        {stage === 'p2prep' && (
          <section className="rounded-xl border border-border p-4">
            <h2 className="mb-2 text-base font-semibold">Part 2 — Cue Card (Preparation)</h2>
            <ul className="list-disc list-inside text-sm text-foreground/80">{script.part2.cueCard.map((l, i) => <li key={i}>{l}</li>)}</ul>
            <p className="mt-2 text-sm text-foreground/70">You have {script.part2.prepSec} seconds to prepare.</p>
          </section>
        )}
        {stage === 'p2talk' && (
          <section className="rounded-xl border border-border p-4">
            <h2 className="mb-2 text-base font-semibold">Part 2 — Talk</h2>
            <p className="text-sm text-foreground/80">Speak for up to {script.part2.speakSec} seconds.</p>
          </section>
        )}
        {stage === 'p3' && (
          <section className="rounded-xl border border-border p-4">
            <h2 className="mb-2 text-base font-semibold">Part 3 — Discussion</h2>
            <ul className="list-disc list-inside text-sm text-foreground/80">{script.part3.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </section>
        )}

        <div className="flex items-center justify-between">
          {stage === 'p1' ? (
            <button onClick={begin} disabled={recording} className="rounded-xl bg-primary px-4 py-2 font-medium text-background hover:opacity-90">{recording ? 'Recording…' : 'Start & Record'}</button>
          ) : (
            <button onClick={proceed} className="rounded-xl bg-primary px-4 py-2 font-medium text-background hover:opacity-90">
              {stage === 'p2prep' ? 'Start Part 2 (Speak)' : stage === 'p2talk' ? 'Proceed to Part 3' : stage === 'p3' ? 'Finish' : 'Next'}
            </button>
          )}
          <Link href="/speaking" className="text-sm underline underline-offset-4">Change script</Link>
        </div>
      </div>
    </Shell>
  );
}
