// pages/speaking/simulator/part2.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import Recorder from '@/components/speaking/Recorder';

// ---------- Types ----------
type Stage = 'idle' | 'intro' | 'prep' | 'record' | 'uploading' | 'scoring' | 'done' | 'error';
type ScoreResult = {
  transcript?: string;
  overall?: number;
  fluency?: number;
  pronunciation?: number;
  lexical?: number;
  grammar?: number;
  feedback?: string;
  attemptId?: string;
  fileUrl?: string;
};

// ---------- Helpers: TTS ----------
function speak(text: string, opts?: SpeechSynthesisUtteranceInit) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const pick = () => {
    const vs = window.speechSynthesis.getVoices();
    return (
      vs.find((x) => /en-(GB|US)/i.test(String(x.lang)) && /female/i.test(String(x.name))) ||
      vs.find((x) => /en-/i.test(String(x.lang))) ||
      null
    );
  };
  const v = pick();
  if (v) u.voice = v;
  Object.assign(u, opts);
  window.speechSynthesis.speak(u);
}

// quick beep cue
async function beep(ms = 300, freq = 880) {
  if (typeof window === 'undefined' || !(window as any).AudioContext) return;
  const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  await new Promise((r) => setTimeout(r, ms));
  o.stop();
  await ctx.close();
}

// ---------- Helpers: Upload + Score (with fallbacks) ----------
async function putSigned(url: string, file: File, headers?: Record<string, string>) {
  const res = await fetch(url, { method: 'PUT', body: file, headers: headers ?? { 'Content-Type': file.type } });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
}

async function postMultipart(path: string, file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(path, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return res.json();
}

async function uploadAudio(file: File): Promise<{ fileUrl: string }> {
  // 1) Try signed URL pattern (ok if not present; we'll fall back)
  try {
    const signed = await fetch('/api/upload/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        bucket: 'speaking-audio',
        visibility: 'public',
      }),
    });
    if (signed.ok) {
      const data = await signed.json();
      if (data.uploadUrl && data.publicUrl) {
        await putSigned(data.uploadUrl, file, data.headers);
        return { fileUrl: data.publicUrl as string };
      }
      if (data.fileUrl) return { fileUrl: data.fileUrl as string };
    }
  } catch {
    // ignore and fall through
  }

  // 2) Generic multipart
  try {
    const data = await postMultipart('/api/upload', file);
    if (data?.fileUrl) return { fileUrl: data.fileUrl as string };
  } catch {
    // ignore and fall through
  }

  // 3) Last resort
  const data = await postMultipart('/api/upload/audio', file);
  if (!data?.fileUrl) throw new Error('No fileUrl returned by upload API');
  return { fileUrl: data.fileUrl as string };
}

async function scoreAudio(fileUrl: string, meta: { section: 'part2'; durationSec: number }): Promise<ScoreResult> {
  // Try Groq audio scorer
  try {
    const r = await fetch('/api/ai/speaking/score-audio-groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl, part: 'p2', durationSec: meta.durationSec }),
    });
    if (r.ok) return await r.json();
  } catch {
    // ignore
  }

  // Fallback scorer
  try {
    const r = await fetch('/api/ai/speaking/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl, section: meta.section, durationSec: meta.durationSec }),
    });
    if (r.ok) return await r.json();
  } catch {
    // ignore
  }

  // Last fallback: generic evaluate
  const r = await fetch('/api/ai/speaking/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileUrl, part: 2 }),
  });
  if (!r.ok) throw new Error('Scoring failed');
  return r.json();
}

// ---------- Page ----------
export default function SpeakingPart2() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('idle');
  const [prepLeft, setPrepLeft] = useState(60);
  const [recordLeft, setRecordLeft] = useState(120);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [ttsOn, setTtsOn] = useState(true);

  // Cue Card — override via query (?topic=...&points=a|b|c)
  const cue = useMemo(() => {
    const topic = (router.query.topic as string) || 'Describe a time when you helped someone.';
    const pts = ((router.query.points as string)?.split('|') ?? [
      'Who the person was',
      'What you did',
      'How they felt after',
      'Why it was important to you',
    ]).filter(Boolean);
    return { topic, points: pts };
  }, [router.query]);

  // Start → Intro → Prep
  const startFlow = useCallback(async () => {
    setError(null);
    setResult(null);
    setStage('intro');

    if (ttsOn) {
      speak('IELTS Speaking Part Two. You will have one minute to prepare, then speak for up to two minutes.', { rate: 0.95 });
      speak(`Topic: ${cue.topic}`, { rate: 0.98 });
      for (const p of cue.points) speak(p, { rate: 1 });
    }
    setTimeout(() => setStage('prep'), 700);
  }, [ttsOn, cue]);

  // PREP countdown (1:00)
  useEffect(() => {
    if (stage !== 'prep') return;
    setPrepLeft(60);
    const id = window.setInterval(() => {
      setPrepLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          beep().finally(() => setStage('record'));
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  // RECORD countdown (2:00). We do NOT force-stop the recorder here;
  // Recorder auto-stops at maxDurationSec and triggers onComplete.
  useEffect(() => {
    if (stage !== 'record') return;
    setRecordLeft(120);
    if (ttsOn) speak('Begin speaking now.');
    beep(200, 960);

    const id = window.setInterval(() => {
      setRecordLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          // Wait for Recorder's onComplete (auto-stop) to advance stage.
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [stage, ttsOn]);

  // Upload + Score + Save attempt
  const handleComplete = useCallback(
    async (file: File, meta: { durationSec: number; mime: string }) => {
      try {
        setStage('uploading');
        const { fileUrl } = await uploadAudio(file);
        setStage('scoring');
        const scored = await scoreAudio(fileUrl, { section: 'part2', durationSec: meta.durationSec });

        // Save attempt
        try {
          const saveRes = await fetch('/api/speaking/attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              section: 'part2',
              fileUrl,
              transcript: scored?.transcript,
              durationSec: meta.durationSec,
              scores: {
                fluency: scored?.fluency,
                lexical: scored?.lexical,
                grammar: scored?.grammar,
                pronunciation: scored?.pronunciation,
                overall: scored?.overall,
                feedback: scored?.feedback,
              },
              topic: cue.topic,
              points: cue.points,
            }),
          });

          if (saveRes.ok) {
            const { attemptId } = await saveRes.json();
            setResult({ ...scored, fileUrl, attemptId });
          } else {
            setResult({ ...scored, fileUrl });
          }
        } catch {
          setResult({ ...scored, fileUrl });
        }

        setStage('done');
      } catch (e: any) {
        setError(e?.message ?? 'Something went wrong while uploading or scoring.');
        setStage('error');
      }
    },
    [cue.topic, cue.points]
  );

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setStage('error');
  }, []);

  const minutes = (n: number) => String(Math.floor(n / 60)).padStart(2, '0');
  const seconds = (n: number) => String(n % 60).padStart(2, '0');

  const gotoReview = useCallback(() => {
    if (result?.attemptId) {
      // Deep link to saved attempt
      router.push(`/speaking/review/${result.attemptId}`);
    } else if (result) {
      // Draft review (no DB row)
      try {
        sessionStorage.setItem('speaking_part2_draft', JSON.stringify(result));
      } catch {}
      router.push('/speaking/review/draft');
    }
  }, [result, router]);

  return (
    <>
      <Head>
        <title>Speaking Simulator – Part 2</title>
      </Head>

      <Container className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">IELTS Speaking – Part 2 (Cue Card)</h1>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ttsOn}
                onChange={(e) => setTtsOn(e.target.checked)}
              />
              Read prompt aloud
            </label>
            <button
              onClick={startFlow}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:bg-gray-300"
              disabled={stage !== 'idle' && stage !== 'done' && stage !== 'error'}
            >
              {stage === 'done' ? 'Restart' : 'Start Part 2'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Cue + Recorder */}
          <div className="md:col-span-2">
            {/* Cue card */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white/60 dark:bg-white/5">
              <div className="text-xs uppercase tracking-wide text-gray-500">Cue Card</div>
              <h2 className="mt-1 text-lg font-medium">{cue.topic}</h2>
              <ul className="mt-3 list-disc pl-5 space-y-1">
                {cue.points.map((p, i) => (
                  <li key={i} className="text-gray-700 dark:text-gray-100">{p}</li>
                ))}
              </ul>

              {/* Timers */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
                  <div className="text-xs text-gray-500">Prep</div>
                  <div className="font-mono text-xl">
                    {stage === 'prep' ? `${minutes(prepLeft)}:${seconds(prepLeft)}` : '01:00'}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
                  <div className="text-xs text-gray-500">Speaking</div>
                  <div className="font-mono text-xl">
                    {stage === 'record' ? `${minutes(recordLeft)}:${seconds(recordLeft)}` : '02:00'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recorder */}
            <div className="mt-6">
              <Recorder
                autoStart={stage === 'record'}
                maxDurationSec={120}
                onComplete={handleComplete}
                onError={handleError}
                className="bg-white/60 dark:bg-white/5"
              />
              <p className="mt-2 text-xs text-gray-500">
                Recording auto-starts after prep and auto-stops at 2 minutes (or when you press Stop &amp; Save).
              </p>
            </div>
          </div>

          {/* Right: Status + Result */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
              <div className="mt-1 text-sm">
                {stage === 'idle' && 'Idle'}
                {stage === 'intro' && 'Reading instructions…'}
                {stage === 'prep' && 'Preparing (1:00)…'}
                {stage === 'record' && 'Recording (2:00)…'}
                {stage === 'uploading' && 'Uploading audio…'}
                {stage === 'scoring' && 'Scoring your response…'}
                {stage === 'done' && 'Done'}
                {stage === 'error' && 'Error'}
              </div>

              {(stage === 'uploading' || stage === 'scoring') && (
                <div className="mt-3 animate-pulse h-2 rounded bg-gray-200 dark:bg-white/10" />
              )}

              {error && (
                <div className="mt-3 text-sm text-rose-600 break-words">
                  {error}
                </div>
              )}
            </div>

            {result && stage === 'done' && (
              <div className="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">AI Result</div>
                <div className="mt-2">
                  <div className="text-3xl font-semibold">
                    {typeof result.overall === 'number' ? result.overall.toFixed(1) : '—'}
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>Fluency: <strong>{result.fluency ?? '—'}</strong></div>
                    <div>Pronunciation: <strong>{result.pronunciation ?? '—'}</strong></div>
                    <div>Lexical: <strong>{result.lexical ?? '—'}</strong></div>
                    <div>Grammar: <strong>{result.grammar ?? '—'}</strong></div>
                  </div>
                  {result.feedback && (
                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                      {result.feedback}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10"
                      onClick={() => setStage('idle')}
                    >
                      Try Again
                    </button>
                    <button
                      className="px-3 py-2 rounded-xl bg-blue-600 text-white"
                      onClick={gotoReview}
                    >
                      Open Review
                    </button>
                  </div>
                  <div className="mt-3">
                    <Link href="/speaking/attempts/" className="text-sm underline">
                      View all attempts
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
