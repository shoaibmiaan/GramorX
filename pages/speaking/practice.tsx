import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import Recorder from '@/components/speaking/Recorder';

// ---------- Focus + Prompt bank ----------
type Focus = 'fluency' | 'lexical' | 'grammar' | 'pronunciation';
const FOCI: Focus[] = ['fluency', 'lexical', 'grammar', 'pronunciation'];

const PROMPTS: Record<Focus, { title: string; prep: number; speak: number; items: string[] }> = {
  fluency: {
    title: 'Fluency & Coherence',
    prep: 15,
    speak: 90,
    items: [
      'Describe a routine you follow every day. Explain why you follow it and how it affects your productivity.',
      'Talk about a hobby you enjoy. How did you start it and how has it changed over time?',
      'Explain a challenge you faced recently and the steps you took to overcome it.',
      'Describe a memorable journey. What made it memorable and what did you learn?',
    ],
  },
  lexical: {
    title: 'Lexical Resource',
    prep: 20,
    speak: 90,
    items: [
      'Describe a time you made a significant purchase. Evaluate its value using precise adjectives and collocations.',
      'Discuss environmental issues in your city. Use topic-specific vocabulary and idiomatic expressions.',
      'Explain how technology influences education. Include nuanced word choice and paraphrasing.',
      'Describe a person you admire. Use varied descriptors and avoid repetition.',
    ],
  },
  grammar: {
    title: 'Grammatical Range & Accuracy',
    prep: 20,
    speak: 90,
    items: [
      'Talk about an event you had planned but had to cancel. Contrast expectations vs reality using complex sentences.',
      'Describe your long-term goals and how you would achieve them if circumstances were different.',
      'Explain a process you are familiar with, using conditional and relative clauses.',
      'Discuss a problem in your neighborhood and propose solutions using modals of advice/obligation.',
    ],
  },
  pronunciation: {
    title: 'Pronunciation',
    prep: 10,
    speak: 60,
    items: [
      'Read a short summary of your favorite film, focusing on stress and intonation.',
      'Explain how to make your favorite recipe, emphasizing word linking and rhythm.',
      'Describe a local place of interest, paying attention to sentence stress and thought groups.',
      'Summarize a news story you read recently, aiming for clear vowel contrasts and consonant endings.',
    ],
  },
};

// ---------- Helpers: TTS / beep ----------
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
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  await new Promise((r) => setTimeout(r, ms));
  o.stop();
  await ctx.close();
}

// ---------- Upload + Score (same fallbacks as simulator) ----------
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
  try {
    const signed = await fetch('/api/upload/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type, bucket: 'speaking', visibility: 'public' }),
    });
    if (signed.ok) {
      const data = await signed.json();
      if (data.uploadUrl && data.publicUrl) {
        await putSigned(data.uploadUrl, file, data.headers);
        return { fileUrl: data.publicUrl as string };
      }
      if (data.fileUrl) return { fileUrl: data.fileUrl as string };
    }
  } catch {}
  try {
    const data = await postMultipart('/api/upload', file);
    if (data?.fileUrl) return { fileUrl: data.fileUrl as string };
  } catch {}
  const data = await postMultipart('/api/upload/audio', file);
  if (!data?.fileUrl) throw new Error('No fileUrl returned by upload API');
  return { fileUrl: data.fileUrl as string };
}

type ScoreResult = {
  transcript?: string;
  fluency?: number;
  lexical?: number;
  grammar?: number;
  pronunciation?: number;
  overall?: number;
  feedback?: string;
};

async function scoreAudio(fileUrl: string, durationSec: number): Promise<ScoreResult> {
  try {
    const r = await fetch('/api/ai/speaking/score-audio-groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl, durationSec, part: 'p2' }),
    });
    if (r.ok) return await r.json();
  } catch {}
  try {
    const r = await fetch('/api/ai/speaking/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl, durationSec, section: 'part2' }),
    });
    if (r.ok) return await r.json();
  } catch {}
  const r = await fetch('/api/ai/speaking/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileUrl, part: 2 }),
  });
  if (!r.ok) throw new Error('Scoring failed');
  return r.json();
}

// ---------- Page ----------
type Stage = 'idle' | 'prep' | 'record' | 'uploading' | 'scoring' | 'done' | 'error';

export default function SpeakingPracticePage() {
  const router = useRouter();
  const qfocus = (router.query.focus as string | undefined)?.toLowerCase() as Focus | undefined;
  const [focus, setFocus] = useState<Focus>(FOCI.includes(qfocus || 'fluency') ? (qfocus as Focus) : 'fluency');

  // sync URL (shallow)
  useEffect(() => {
    const current = (router.query.focus as string | undefined)?.toLowerCase();
    if (current !== focus) {
      const url = { pathname: router.pathname, query: { ...router.query, focus } };
      router.replace(url, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  const bank = PROMPTS[focus];
  const [prompt, setPrompt] = useState<string>(() => bank.items[Math.floor(Math.random() * bank.items.length)]);

  useEffect(() => {
    // when focus changes, pick a new prompt & timers
    setPrompt(PROMPTS[focus].items[Math.floor(Math.random() * PROMPTS[focus].items.length)]);
  }, [focus]);

  const [ttsOn, setTtsOn] = useState(true);
  const [stage, setStage] = useState<Stage>('idle');
  const [prepLeft, setPrepLeft] = useState(bank.prep);
  const [speakLeft, setSpeakLeft] = useState(bank.speak);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(bank.speak);

  // Rerun timers when focus changes
  useEffect(() => {
    setPrepLeft(PROMPTS[focus].prep);
    setSpeakLeft(PROMPTS[focus].speak);
    setDuration(PROMPTS[focus].speak);
  }, [focus]);

  // Flow handlers
  const startDrill = useCallback(() => {
    setError(null);
    setResult(null);
    setFileUrl(null);
    setStage('prep');
    // TTS
    if (ttsOn) {
      speak(`${PROMPTS[focus].title}. You will have ${bank.prep} seconds to prepare, then speak for ${bank.speak} seconds.`);
      speak(`Prompt: ${prompt}`, { rate: 1 });
    }
  }, [ttsOn, focus, bank.prep, bank.speak, prompt]);

  // PREP
  useEffect(() => {
    if (stage !== 'prep') return;
    setPrepLeft(bank.prep);
    const id = window.setInterval(() => {
      setPrepLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          beep(180, 960).finally(() => setStage('record'));
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [stage, bank.prep]);

  // RECORD countdown (Recorder auto-stop handles finalization)
  useEffect(() => {
    if (stage !== 'record') return;
    setSpeakLeft(bank.speak);
    if (ttsOn) speak('Begin speaking now.');
    beep(180, 960);
    const id = window.setInterval(() => {
      setSpeakLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          // Recorder will stop via maxDurationSec
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [stage, bank.speak, ttsOn]);

  // On recording complete → upload → score
  const onComplete = useCallback(async (file: File, meta: { durationSec: number; mime: string }) => {
    try {
      setDuration(meta.durationSec || bank.speak);
      setStage('uploading');
      const up = await uploadAudio(file);
      setFileUrl(up.fileUrl);
      setStage('scoring');
      const scored = await scoreAudio(up.fileUrl, meta.durationSec || bank.speak);
      setResult(scored);
      setStage('done');
    } catch (e: any) {
      setError(e?.message || 'Could not process recording.');
      setStage('error');
    }
  }, [bank.speak]);

  const onError = useCallback((msg: string) => {
    setError(msg);
    setStage('error');
  }, []);

  const minutes = (n: number) => String(Math.floor(n / 60)).padStart(2, '0');
  const seconds = (n: number) => String(n % 60).padStart(2, '0');

  async function saveAsAttempt() {
    if (!fileUrl || !result) return;
    try {
      const r = await fetch('/api/speaking/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'part2', // practice defaults to part2-style monologue
          fileUrl,
          transcript: result.transcript,
          durationSec: duration,
          scores: {
            fluency: result.fluency,
            lexical: result.lexical,
            grammar: result.grammar,
            pronunciation: result.pronunciation,
            overall: result.overall,
            feedback: result.feedback,
          },
          topic: PROMPTS[focus].title,
          points: [prompt],
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      const { attemptId } = await r.json();
      window.location.href = `/speaking/review/${attemptId}`;
    } catch (e: any) {
      setError(e.message || 'Could not save attempt');
    }
  }

  // UI
  return (
    <>
      <Head><title>Speaking Practice</title></Head>
      <Container className="py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold">Speaking Practice</h1>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={ttsOn} onChange={(e) => setTtsOn(e.target.checked)} />
              Read prompt aloud
            </label>
            <Link href="/speaking/attempts" className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10">Attempts</Link>
            <Link href="/speaking/simulator/part2" className="px-3 py-2 rounded-xl bg-emerald-600 text-white">Part 2 Simulator</Link>
          </div>
        </div>

        {/* Focus selector */}
        <div className="flex flex-wrap gap-2 mb-5">
          {FOCI.map((f) => (
            <button
              key={f}
              onClick={() => setFocus(f)}
              className={`px-3 py-1.5 rounded-xl border text-sm ${
                f === focus
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-white/10'
              }`}
            >
              {PROMPTS[f].title}
            </button>
          ))}
          <button
            onClick={() => setPrompt(PROMPTS[focus].items[Math.floor(Math.random() * PROMPTS[focus].items.length)])}
            className="ml-auto px-3 py-1.5 rounded-xl border border-gray-300 dark:border-white/10 text-sm"
          >
            New Prompt
          </button>
        </div>

        {/* Prompt card */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white/60 dark:bg-white/5">
          <div className="text-xs uppercase tracking-wide text-gray-500">{PROMPTS[focus].title}</div>
          <p className="mt-2 text-base">{prompt}</p>

          {/* Timers */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
              <div className="text-xs text-gray-500">Prep</div>
              <div className="font-mono text-xl">
                {stage === 'prep' ? `${minutes(prepLeft)}:${seconds(prepLeft)}` : `${minutes(bank.prep)}:${seconds(bank.prep)}`}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
              <div className="text-xs text-gray-500">Speaking</div>
              <div className="font-mono text-xl">
                {stage === 'record' ? `${minutes(speakLeft)}:${seconds(speakLeft)}` : `${minutes(bank.speak)}:${seconds(bank.speak)}`}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={startDrill}
              disabled={stage !== 'idle' && stage !== 'done' && stage !== 'error'}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:bg-gray-300"
            >
              {stage === 'done' ? 'Restart Drill' : 'Start Drill'}
            </button>
            <button
              onClick={() => setStage('idle')}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/10"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Recorder */}
        <div className="mt-6">
          <Recorder
            autoStart={stage === 'record'}
            maxDurationSec={bank.speak}
            onComplete={onComplete}
            onError={onError}
            className="bg-white/60 dark:bg-white/5"
          />
          <p className="mt-2 text-xs text-gray-500">
            Recording auto-starts after prep and auto-stops at the time limit.
          </p>
        </div>

        {/* Status + Result */}
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
              <div className="mt-1 text-sm">
                {stage === 'idle' && 'Idle'}
                {stage === 'prep' && `Preparing (${bank.prep}s)…`}
                {stage === 'record' && `Recording (${bank.speak}s)…`}
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
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
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
                    <button onClick={saveAsAttempt} className="px-3 py-2 rounded-xl bg-blue-600 text-white">
                      Save as Attempt
                    </button>
                    <Link href="/speaking/attempts" className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10">
                      View Attempts
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Quick Jump</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <Link href="/listening" className="rounded-lg border border-gray-200 dark:border-white/10 p-2 text-center">Listening</Link>
                <Link href="/reading" className="rounded-lg border border-gray-200 dark:border-white/10 p-2 text-center">Reading</Link>
                <Link href="/writing" className="rounded-lg border border-gray-200 dark:border-white/10 p-2 text-center">Writing</Link>
                <Link href="/speaking/attempts" className="rounded-lg border border-gray-200 dark:border-white/10 p-2 text-center">Attempts</Link>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Tips for {PROMPTS[focus].title}</div>
              <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                {focus === 'fluency' && (
                  <>
                    <li>Keep speaking—avoid long pauses; use fillers sparingly.</li>
                    <li>Use signposting: “firstly… secondly… finally…”.</li>
                  </>
                )}
                {focus === 'lexical' && (
                  <>
                    <li>Paraphrase to avoid repetition; use collocations.</li>
                    <li>Prefer precise adjectives/adverbs over generic words.</li>
                  </>
                )}
                {focus === 'grammar' && (
                  <>
                    <li>Mix simple, compound and complex sentences naturally.</li>
                    <li>Watch subject–verb agreement and tense consistency.</li>
                  </>
                )}
                {focus === 'pronunciation' && (
                  <>
                    <li>Chunk ideas into thought groups; drop pitch at sentence ends.</li>
                    <li>Release final consonants; practice vowel length contrasts.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
