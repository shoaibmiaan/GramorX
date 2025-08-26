import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import Recorder, { RecorderHandle } from '@/components/speaking/Recorder';

// ===== Part 3 Bank (discussion prompts) =====
const PART3_PROMPTS = [
  'How has technology changed the way people communicate? Do you think these changes are positive?',
  'Should governments invest more in public transport or roads? Why?',
  'Do advertisements influence people’s choices too much? How?',
  'Is it better to study alone or in groups? Why?',
  'How can cities become more environmentally friendly?',
  'To what extent should schools focus on creativity vs. exams?',
];

type Stage = 'idle' | 'prep' | 'record' | 'uploading' | 'scoring' | 'done' | 'error';
type ScoreResult = {
  transcript?: string;
  fluency?: number;
  lexical?: number;
  grammar?: number;
  pronunciation?: number;
  overall?: number;
  feedback?: string;
};

function speak(text: string, opts?: SpeechSynthesisUtteranceInit) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const v =
    window.speechSynthesis.getVoices().find((x) => /en-(GB|US)/i.test(String(x.lang)) && /female/i.test(String(x.name))) ||
    window.speechSynthesis.getVoices().find((x) => /en-/i.test(String(x.lang)));
  if (v) u.voice = v;
  Object.assign(u, opts);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
async function beep(ms = 250, freq = 880) {
  if (typeof window === 'undefined' || !(window as any).AudioContext) return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  o.connect(g); g.connect(ctx.destination);
  o.start(); await new Promise((r) => setTimeout(r, ms)); o.stop(); await ctx.close();
}

// ===== Upload + Score helpers =====
async function putSigned(url: string, file: File, headers?: Record<string, string>) {
  const res = await fetch(url, { method: 'PUT', body: file, headers: headers ?? { 'Content-Type': file.type } });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
}
async function postMultipart(path: string, file: File) {
  const fd = new FormData(); fd.append('file', file);
  const res = await fetch(path, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return res.json();
}
async function uploadAudio(file: File): Promise<{ fileUrl: string }> {
  try {
    const signed = await fetch('/api/upload/signed-url', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type, bucket: 'speaking', visibility: 'public' }),
    });
    if (signed.ok) {
      const data = await signed.json();
      if (data.uploadUrl && data.publicUrl) { await putSigned(data.uploadUrl, file, data.headers); return { fileUrl: data.publicUrl }; }
      if (data.fileUrl) return { fileUrl: data.fileUrl };
    }
  } catch {}
  try {
    const data = await postMultipart('/api/upload', file);
    if (data?.fileUrl) return { fileUrl: data.fileUrl };
  } catch {}
  const data = await postMultipart('/api/upload/audio', file);
  if (!data?.fileUrl) throw new Error('No fileUrl returned by upload API');
  return { fileUrl: data.fileUrl };
}
async function scoreAudio(fileUrl: string, durationSec: number): Promise<ScoreResult> {
  try {
    const r = await fetch('/api/ai/speaking/score-audio-groq', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl, durationSec, part: 'p3' }),
    });
    if (r.ok) return await r.json();
  } catch {}
  try {
    const r = await fetch('/api/ai/speaking/score', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl, durationSec, section: 'part3' }),
    });
    if (r.ok) return await r.json();
  } catch {}
  const r = await fetch('/api/ai/speaking/evaluate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileUrl, part: 3 }),
  });
  if (!r.ok) throw new Error('Scoring failed');
  return r.json();
}

export default function SpeakingPart3() {
  const router = useRouter();
  const [ttsOn, setTtsOn] = useState(true);
  const [stage, setStage] = useState<Stage>('idle');
  const [prepLeft, setPrepLeft] = useState(15);
  const [left, setLeft] = useState(90);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const recRef = useRef<RecorderHandle | null>(null);

  const prompt = useMemo(() => {
    const p = (router.query.q as string) || PART3_PROMPTS[Math.floor(Math.random() * PART3_PROMPTS.length)];
    return p;
  }, [router.query.q]);

  const start = useCallback(() => {
    setError(null); setResult(null); setFileUrl(null);
    setStage('prep'); setPrepLeft(15); setLeft(90);
    if (ttsOn) { speak('Part three. You will discuss the following question. Take a short moment to think.', { rate: 0.95 }); speak(`Question: ${prompt}`, { rate: 1 }); }
  }, [ttsOn, prompt]);

  // PREP
  useEffect(() => {
    if (stage !== 'prep') return;
    const id = window.setInterval(() => {
      setPrepLeft((s) => {
        if (s <= 1) { window.clearInterval(id); beep(180, 960).finally(() => setStage('record')); }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  // RECORD
  useEffect(() => {
    if (stage !== 'record') return;
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) { window.clearInterval(id); recRef.current?.stop().catch(() => {}); }
        return s - 1;
      });
    }, 1000);
    if (ttsOn) speak('Begin speaking now.');
    beep(180, 960);
    return () => window.clearInterval(id);
  }, [stage, ttsOn]);

  const onComplete = useCallback(async (file: File, meta: { durationSec: number; mime: string }) => {
    try {
      setStage('uploading');
      const up = await uploadAudio(file);
      setFileUrl(up.fileUrl);
      setStage('scoring');
      const scored = await scoreAudio(up.fileUrl, meta.durationSec || 90);
      setResult(scored);
      setStage('done');
    } catch (e: any) {
      setError(e?.message || 'Could not process recording.'); setStage('error');
    }
  }, []);

  const onError = useCallback((msg: string) => { setError(msg); setStage('error'); }, []);
  const minutes = (n: number) => String(Math.floor(n / 60)).padStart(2, '0');
  const seconds = (n: number) => String(n % 60).padStart(2, '0');

  async function saveAttempt() {
    if (!fileUrl || !result) return;
    try {
      const r = await fetch('/api/speaking/attempts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'part3', fileUrl,
          transcript: result.transcript, durationSec: Math.max(1, 90 - left),
          scores: {
            fluency: result.fluency, lexical: result.lexical, grammar: result.grammar,
            pronunciation: result.pronunciation, overall: result.overall, feedback: result.feedback,
          },
          topic: 'Part 3 — Discussion', points: [prompt],
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      const { attemptId } = await r.json();
      router.push(`/speaking/review/${attemptId}`);
    } catch (e: any) { setError(e.message || 'Could not save attempt'); }
  }

  function newPrompt() {
    const idx = Math.floor(Math.random() * PART3_PROMPTS.length);
    router.replace({ pathname: router.pathname, query: { q: PART3_PROMPTS[idx] } }, undefined, { shallow: true });
    setStage('idle'); setLeft(90); setPrepLeft(15); setResult(null); setError(null);
  }

  return (
    <>
      <Head><title>Speaking Simulator — Part 3</title></Head>
      <Container className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">IELTS Speaking — Part 3 (Discussion)</h1>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={ttsOn} onChange={(e) => setTtsOn(e.target.checked)} />
              Read question aloud
            </label>
            <Link href="/speaking/attempts" className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10">Attempts</Link>
          </div>
        </div>

        {/* Prompt card */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white/60 dark:bg-white/5">
          <div className="text-xs uppercase tracking-wide text-gray-500">Question</div>
          <p className="mt-2 text-base">{prompt}</p>

          {/* Timers */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
              <div className="text-xs text-gray-500">Prep</div>
              <div className="font-mono text-xl">{stage === 'prep' ? `${minutes(prepLeft)}:${seconds(prepLeft)}` : '00:15'}</div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
              <div className="text-xs text-gray-500">Speaking</div>
              <div className="font-mono text-xl">{stage === 'record' ? `${minutes(left)}:${seconds(left)}` : '01:30'}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={start} disabled={stage !== 'idle' && stage !== 'done' && stage !== 'error'}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:bg-gray-300">
              {stage === 'done' ? 'Discuss Again' : 'Start Discussion'}
            </button>
            <button onClick={newPrompt} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/10">New Question</button>
          </div>
        </div>

        {/* Recorder */}
        <div className="mt-6">
          <Recorder
            ref={recRef}
            autoStart={stage === 'record'}
            maxDurationSec={90}
            onComplete={onComplete}
            onError={onError}
            className="bg-white/60 dark:bg-white/5"
          />
          <p className="mt-2 text-xs text-gray-500">Auto-starts after prep and auto-stops at 90 seconds.</p>
        </div>

        {/* Status + Result */}
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
              <div className="mt-1 text-sm">
                {stage === 'idle' && 'Idle'}
                {stage === 'prep' && 'Preparing (0:15)…'}
                {stage === 'record' && 'Recording (1:30)…'}
                {stage === 'uploading' && 'Uploading audio…'}
                {stage === 'scoring' && 'Scoring your response…'}
                {stage === 'done' && 'Done'}
                {stage === 'error' && 'Error'}
              </div>
              {(stage === 'uploading' || stage === 'scoring') && (
                <div className="mt-3 animate-pulse h-2 rounded bg-gray-200 dark:bg-white/10" />
              )}
              {error && <div className="mt-3 text-sm text-rose-600 break-words">{error}</div>}
            </div>

            {result && stage === 'done' && (
              <div className="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">AI Result</div>
                <div className="mt-2">
                  <div className="text-3xl font-semibold">{typeof result.overall === 'number' ? result.overall.toFixed(1) : '—'}</div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>Fluency: <strong>{result.fluency ?? '—'}</strong></div>
                    <div>Pronunciation: <strong>{result.pronunciation ?? '—'}</strong></div>
                    <div>Lexical: <strong>{result.lexical ?? '—'}</strong></div>
                    <div>Grammar: <strong>{result.grammar ?? '—'}</strong></div>
                  </div>
                  {result.transcript && (
                    <div className="mt-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500">Transcript</div>
                      <pre className="mt-1 whitespace-pre-wrap text-sm">{result.transcript}</pre>
                    </div>
                  )}
                  {result.feedback && (
                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{result.feedback}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button onClick={saveAttempt} className="px-3 py-2 rounded-xl bg-blue-600 text-white">Save as Attempt</button>
                    <Link href="/speaking/attempts" className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10">View Attempts</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Quick Jump</div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <Link href="/speaking/simulator" className="rounded-lg border border-gray-200 dark:border-white/10 p-2 text-center">Simulator Hub</Link>
                <Link href="/speaking/simulator/part1" className="rounded-lg border border-gray-200 dark:border-white/10 p-2 text-center">Part 1</Link>
                <Link href="/speaking/simulator/part2" className="rounded-lg border border-gray-200 dark:border-white/10 p-2 text-center">Part 2</Link>
                <Link href="/speaking/practice?mode=part3" className="rounded-lg border border-gray-200 dark:border-white/10 p-2 text-center">Practice</Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
