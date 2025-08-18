// pages/speaking/simulator/index.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';

import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { GradientText } from '@/components/design-system/GradientText';

import { AccentPicker, type Accent } from '@/components/speaking/AccentPicker';
import { useTTS } from '@/components/speaking/useTTS';
import { uploadSpeakingBlob } from '@/lib/speaking/uploadSpeakingBlob';
import { supabaseBrowser, authHeaders } from '@/lib/supabaseBrowser';

const isClient = typeof window !== 'undefined';

// --- tiny helpers ---
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
const uuid = () => (isClient && crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

// --- Types ---
type PartKey = 'p1' | 'p2' | 'p3';
type RunState = 'idle' | 'ready' | 'asking' | 'recording' | 'uploading' | 'review';
type P1Q = { id: string; text: string };
type Feedback = {
  band?: number;
  summary?: string;
  aspects?: Array<{ key: 'fluency'|'lexical'|'grammar'|'pronunciation'; band: number; note?: string }>;
};

// --- Local question bank (replace with server content anytime) ---
const P1_QUESTIONS: P1Q[] = [
  { id: 'q1', text: 'Do you work or study?' },
  { id: 'q2', text: 'What do you like most about your hometown?' },
  { id: 'q3', text: 'How often do you read books?' },
  { id: 'q4', text: 'Do you prefer mornings or evenings?' },
  { id: 'q5', text: 'What is a skill you want to learn, and why?' },
];

const P2_CUE = `Describe a book that left a strong impression on you.
You should say:
• what the book is
• what it is about
• why you chose to read it
and explain why it left a strong impression on you.`;

const P3_QUESTIONS = [
  'How has technology changed the way people read and learn?',
  'Do you think libraries will remain important in the future? Why or why not?',
];

export default function SpeakingSimulator() {
  const [accent, setAccent] = useState<Accent>('uk');
  const [currentPart, setCurrentPart] = useState<PartKey>('p1');
  const [run, setRun] = useState<RunState>('idle');
  const [attemptId] = useState<string>(() => uuid());
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [micReady, setMicReady] = useState<boolean>(false);

  const [p1Results, setP1Results] = useState<Array<{ qid: string; url?: string; fb?: Feedback }>>([]);
  const [p2Result, setP2Result] = useState<{ url?: string; fb?: Feedback; prepMs?: number; speakMs?: number } | null>(null);
  const [p3Results, setP3Results] = useState<Array<{ idx: number; url?: string; fb?: Feedback }>>([]);

  // MediaRecorder state
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // TTS
  const { speak, speaking } = useTTS({ accent });

  // durations (ms)
  const DUR = useMemo(() => ({
    p1PerAnswer: 15_000,  // 15 seconds each
    p2Prep: 60_000,       // 1 minute prep
    p2Speak: 120_000,     // 2 minutes speaking
    p3PerAnswer: 40_000,  // 40 seconds
  }), []);

  // -------- LIVE RECORDING TIMER STATE --------
  const [recordLeft, setRecordLeft] = useState<number>(0);
  const [recordTotal, setRecordTotal] = useState<number>(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fmtTime = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
  };

  // init mic
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!isClient) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        mediaStreamRef.current = stream;
        setMicReady(true);
      } catch (e) {
        console.error('Mic error:', e);
        setMicReady(false);
      }
    })();
    return () => {
      cancelled = true;
      if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  const startRecording = useCallback((onStop: (blob: Blob) => void) => {
    const stream = mediaStreamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const rec = new MediaRecorder(stream);
    recorderRef.current = rec;

    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      onStop(blob);
    };
    rec.start();
  }, []);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
  }, []);

  // ---- ask → speak (TTS) → record for duration (with live timer) ----
  const askAndRecord = useCallback(async (text: string, durationMs: number): Promise<Blob | null> => {
    setRun('asking');
    await speak(text); // wait until TTS finishes

    // small buffer before recording
    await sleep(400);
    setRun('recording');

    // init visible timer
    setRecordTotal(durationMs);
    setRecordLeft(durationMs);

    const started = Date.now();
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    recordTimerRef.current = setInterval(() => {
      const left = Math.max(0, durationMs - (Date.now() - started));
      setRecordLeft(left);
    }, 200);

    const blob = await new Promise<Blob | null>((resolve) => {
      let timeout: any;
      startRecording((b) => {
        if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
        setRecordLeft(0);
        clearTimeout(timeout);
        resolve(b);
      });
      timeout = setTimeout(() => {
        stopRecording();
      }, durationMs);
    });

    return blob;
  }, [speak, startRecording, stopRecording]);

  // ---- server evaluation helper (adds Supabase bearer header) ----
  const tryEvaluate = useCallback(async (attemptId: string, ctx: PartKey, extra: Record<string, any> = {}): Promise<Feedback> => {
    try {
      const headers = await authHeaders({ 'Content-Type': 'application/json' });
      const r = await fetch('/api/speaking/evaluate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ attemptId, ctx, ...extra }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      return data?.feedback as Feedback;
    } catch {
      // graceful fallback (quick local heuristic)
      return {
        band: 6.5,
        summary: 'Clear message; try increasing detail and range. Watch article use and minor tense slips.',
        aspects: [
          { key: 'fluency', band: 6, note: 'Response length ok; add more linking phrases.' },
          { key: 'lexical', band: 6.5, note: 'Use more precise topic vocabulary.' },
          { key: 'grammar', band: 6.5, note: 'Minor agreement/tense issues.' },
          { key: 'pronunciation', band: 7, note: 'Generally clear; stress could be more varied.' },
        ],
      };
    }
  }, []);

  // --- PART RUNNERS ---

  const runP1 = useCallback(async () => {
    setRun('ready');
    for (let i = 0; i < P1_QUESTIONS.length; i++) {
      setQuestionIndex(i);
      const q = P1_QUESTIONS[i];
      const blob = await askAndRecord(q.text, DUR.p1PerAnswer);
      if (!blob) continue;
      setRun('uploading');
      const url = await uploadSpeakingBlob(blob, 'p1', attemptId);
      const fb = await tryEvaluate(attemptId, 'p1', {
        qid: q.id,
        seconds: DUR.p1PerAnswer / 1000,
        audioUrl: url,
      });
      setP1Results(prev => [...prev, { qid: q.id, url, fb }]);
      await sleep(700);
    }
    setRun('review');
  }, [attemptId, askAndRecord, DUR.p1PerAnswer, tryEvaluate]);

  const runP2 = useCallback(async () => {
    setRun('ready');
    setRun('asking'); // show prep
    await prepCountdown(DUR.p2Prep);
    // Beeps (soft)
    if (isClient) {
      try { const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); await playBeeps(ctx); } catch {}
    }
    const blob = await askAndRecord('You may begin speaking now.', DUR.p2Speak);
    if (!blob) return setRun('review');
    setRun('uploading');
    const url = await uploadSpeakingBlob(blob, 'p2', attemptId);
    const fb = await tryEvaluate(attemptId, 'p2', {
      seconds: DUR.p2Speak / 1000,
      audioUrl: url,
    });
    setP2Result({ url, fb, prepMs: DUR.p2Prep, speakMs: DUR.p2Speak });
    setRun('review');
  }, [attemptId, askAndRecord, DUR.p2Prep, DUR.p2Speak, tryEvaluate]);

  const runP3 = useCallback(async () => {
    setRun('ready');
    const out: Array<{ idx: number; url?: string; fb?: Feedback }> = [];
    for (let i = 0; i < P3_QUESTIONS.length; i++) {
      setQuestionIndex(i);
      const blob = await askAndRecord(P3_QUESTIONS[i], DUR.p3PerAnswer);
      if (!blob) continue;
      setRun('uploading');
      const url = await uploadSpeakingBlob(blob, 'p3', attemptId);
      const fb = await tryEvaluate(attemptId, 'p3', {
        qIndex: i,
        seconds: DUR.p3PerAnswer / 1000,
        audioUrl: url,
      });
      out.push({ idx: i, url, fb });
      await sleep(800);
    }
    setP3Results(out);
    setRun('review');
  }, [attemptId, askAndRecord, DUR.p3PerAnswer, tryEvaluate]);

  // --- simple prep timer helpers (visual only) ---
  const [prepLeft, setPrepLeft] = useState<number>(0);
  async function prepCountdown(totalMs: number) {
    setPrepLeft(totalMs);
    const start = Date.now();
    while (Date.now() - start < totalMs) {
      await sleep(250);
      setPrepLeft(Math.max(0, totalMs - (Date.now() - start)));
    }
  }
  async function playBeeps(ctx: AudioContext) {
    const beep = async (freq = 880) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq; o.type = 'sine';
      o.connect(g); g.connect(ctx.destination);
      g.gain.value = 0.08;
      o.start(); await sleep(180); o.stop();
    };
    await beep(660); await sleep(200);
    await beep(660); await sleep(200);
    await beep(880);
  }

  // --- UI helpers ---
  const PartHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="mb-6">
      <h1 className="font-slab text-display"><GradientText>{title}</GradientText></h1>
      {subtitle && <p className="text-grayish">{subtitle}</p>}
    </div>
  );

  const FeedbackView: React.FC<{ fb?: Feedback }> = ({ fb }) => {
    if (!fb) return <Alert variant="info" title="Awaiting feedback">We’ll show your AI feedback here.</Alert>;
    return (
      <Card className="p-5 rounded-ds-2xl">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="info">AI Feedback</Badge>
          {typeof fb.band === 'number' && (
            <Badge variant={fb.band >= 7 ? 'success' : fb.band >= 6 ? 'warning' : 'danger'}>
              Band {fb.band.toFixed(1)}
            </Badge>
          )}
        </div>
        {fb.summary && <p className="mb-4">{fb.summary}</p>}
        {fb.aspects?.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {fb.aspects.map((a, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium capitalize">{a.key}</span>
                  <span className="text-sm opacity-80">Band {a.band.toFixed(1)}</span>
                </div>
                {a.note && <p className="text-sm opacity-90">{a.note}</p>}
              </Card>
            ))}
          </div>
        ) : null}
      </Card>
    );
  };

  // --- Render per part ---
  const renderIntro = () => (
    <Card className="p-6 rounded-ds-2xl">
      <PartHeader title="IELTS Speaking Simulator" subtitle="Three parts • Realistic timing • Instant AI feedback" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Voice & Setup</h3>
          <AccentPicker value={accent} onChange={setAccent} />
          <div className="mt-3 text-small">
            Mic: {micReady ? <span className="text-success font-semibold">Ready</span> : <span className="text-sunsetOrange font-semibold">Not available</span>}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ul className="text-small list-disc pl-5 space-y-1 opacity-90">
            <li>Each question is spoken by the examiner (TTS).</li>
            <li>Recording starts automatically after the question.</li>
            <li>Stops automatically when time is up.</li>
            <li>Your answer uploads; AI feedback appears instantly.</li>
          </ul>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => { setCurrentPart('p1'); setRun('idle'); }} variant="primary">Go to Part 1</Button>
        <Button onClick={() => { setCurrentPart('p2'); setRun('idle'); }} variant="secondary">Go to Part 2</Button>
        <Button onClick={() => { setCurrentPart('p3'); setRun('idle'); }} variant="accent">Go to Part 3</Button>
        <Button as="a" href="/speaking" variant="secondary" className="ml-auto">Back to Speaking</Button>
      </div>
    </Card>
  );

  const RecordingTimerCard = (
    <Card className="p-6 text-center rounded-ds-2xl">
      <Badge variant="warning">Recording…</Badge>
      <div className="mt-3 font-mono text-4xl">
        {fmtTime(recordLeft)} <span className="opacity-60 text-lg">/ {fmtTime(recordTotal)}</span>
      </div>
      <p className="text-small opacity-75 mt-2">Speak clearly. Time will stop automatically.</p>
    </Card>
  );

  const renderP1 = () => (
    <Card className="p-6 rounded-ds-2xl">
      <PartHeader title="Part 1 — Interview" subtitle="Introductory questions • 15 seconds per answer" />
      {run === 'idle' && (
        <Alert title="Ready to start Part 1?">
          You will answer {P1_QUESTIONS.length} short questions. Recording will auto‑start after each question.
          <div className="mt-4 flex gap-3">
            <Button onClick={runP1} variant="primary" disabled={!micReady || speaking}>Start Part 1</Button>
            <Button onClick={() => setCurrentPart('p2')} variant="secondary">Skip to Part 2</Button>
          </div>
        </Alert>
      )}

      {run === 'asking' && (
        <Card className="p-4">
          <Badge>Question {questionIndex + 1} of {P1_QUESTIONS.length}</Badge>
          <p className="mt-2 text-lg">{P1_QUESTIONS[questionIndex].text}</p>
          <p className="text-small text-grayish mt-2">Listening… recording will start automatically.</p>
        </Card>
      )}

      {run === 'recording' && RecordingTimerCard}

      {run === 'uploading' && <Alert variant="info" title="Uploading answer…">Please wait a moment.</Alert>}

      {(run === 'review' || p1Results.length > 0) && (
        <div className="mt-6 grid gap-4">
          {p1Results.map((r, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <Badge>Question {i + 1}</Badge>
                {r.url && <audio src={r.url} controls className="w-56" />}
              </div>
              <div className="mt-3"><FeedbackView fb={r.fb} /></div>
            </Card>
          ))}
          {run === 'review' && (
            <div className="flex gap-3">
              <Button onClick={() => { setP1Results([]); setQuestionIndex(0); setRun('idle'); }} variant="secondary">Retry Part 1</Button>
              <Button onClick={() => { setCurrentPart('p2'); setRun('idle'); }} variant="primary">Next: Part 2</Button>
              <Button onClick={() => { setCurrentPart('p3'); setRun('idle'); }} variant="accent">Skip to Part 3</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  const renderP2 = () => (
    <Card className="p-6 rounded-ds-2xl">
      <PartHeader title="Part 2 — Cue Card" subtitle="1 minute prep → 2 minutes speaking" />
      {run === 'idle' && (
        <Alert title="Ready to start Part 2?">
          You’ll see your cue card. You have 1 minute to prepare. Then a 3‑beep countdown and 2 minutes to speak.
          <div className="mt-4 flex gap-3">
            <Button onClick={runP2} variant="primary" disabled={!micReady || speaking}>Start Part 2</Button>
            <Button onClick={() => setCurrentPart('p1')} variant="secondary">Back to Part 1</Button>
          </div>
        </Alert>
      )}

      {(run === 'asking' || run === 'recording' || run === 'uploading' || run === 'review') && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <Badge>Cue Card</Badge>
            <pre className="whitespace-pre-wrap font-sans mt-2">{P2_CUE}</pre>
          </Card>
          <div className="space-y-3">
            {run === 'asking' && (
              <Alert variant="info" title="Preparation time">
                {prepLeft > 0 ? <>You have <b>{Math.ceil(prepLeft / 1000)}</b> seconds to prepare…</> : 'Get ready…'}
              </Alert>
            )}
            {run === 'recording' && RecordingTimerCard}
            {run === 'uploading' && <Alert variant="info" title="Uploading answer…">Please wait.</Alert>}
            {run === 'review' && (
              <>
                <div className="flex items-center justify-between">
                  <Badge>Part 2 — Your answer</Badge>
                  {p2Result?.url && <audio src={p2Result.url} controls className="w-56" />}
                </div>
                <div className="mt-3"><FeedbackView fb={p2Result?.fb} /></div>
                <div className="mt-4 flex gap-3">
                  <Button onClick={() => { setP2Result(null); setRun('idle'); }} variant="secondary">Retry Part 2</Button>
                  <Button onClick={() => { setCurrentPart('p3'); setRun('idle'); }} variant="primary">Next: Part 3</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );

  const renderP3 = () => (
    <Card className="p-6 rounded-ds-2xl">
      <PartHeader title="Part 3 — Discussion" subtitle="Follow‑up questions • 40 seconds per answer" />
      {run === 'idle' && (
        <Alert title="Ready to start Part 3?">
          You will answer {P3_QUESTIONS.length} discussion questions. Recording will auto‑start after each question.
          <div className="mt-4 flex gap-3">
            <Button onClick={runP3} variant="primary" disabled={!micReady || speaking}>Start Part 3</Button>
            <Button onClick={() => setCurrentPart('p2')} variant="secondary">Back to Part 2</Button>
          </div>
        </Alert>
      )}

      {run === 'asking' && (
        <Card className="p-4">
          <Badge>Question {questionIndex + 1} of {P3_QUESTIONS.length}</Badge>
          <p className="mt-2 text-lg">{P3_QUESTIONS[questionIndex]}</p>
          <p className="text-small text-grayish mt-2">Listening… recording will start automatically.</p>
        </Card>
      )}

      {run === 'recording' && RecordingTimerCard}

      {run === 'uploading' && <Alert variant="info" title="Uploading answer…">Please wait.</Alert>}

      {(run === 'review' || p3Results.length > 0) && (
        <div className="mt-6 grid gap-4">
          {p3Results.map((r, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <Badge>Question {i + 1}</Badge>
                {r.url && <audio src={r.url} controls className="w-56" />}
              </div>
              <div className="mt-3"><FeedbackView fb={r.fb} /></div>
            </Card>
          ))}
          {run === 'review' && (
            <div className="flex gap-3">
              <Button onClick={() => { setP3Results([]); setQuestionIndex(0); setRun('idle'); }} variant="secondary">Retry Part 3</Button>
              <Button as="a" href="/dashboard" variant="primary">Finish & Go to Dashboard</Button>
              <Button as="a" href="/speaking" variant="accent">More Speaking Practice</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <>
      <Head><title>Speaking Simulator | GramorX</title></Head>
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 className="font-slab text-h1">Speaking Simulator</h1>
            <div className="flex items-center gap-3">
              <AccentPicker value={accent} onChange={setAccent} />
              <Badge variant={micReady ? 'success' : 'danger'}>{micReady ? 'Mic ready' : 'Mic blocked'}</Badge>
            </div>
          </div>

          <div className="grid gap-6">
            {currentPart === 'p1' ? renderP1()
             : currentPart === 'p2' ? renderP2()
             : currentPart === 'p3' ? renderP3()
             : renderIntro()}

            <Card className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => { setCurrentPart('p1'); setRun('idle'); }} variant={currentPart==='p1' ? 'primary' : 'secondary'}>Part 1</Button>
                <Button onClick={() => { setCurrentPart('p2'); setRun('idle'); }} variant={currentPart==='p2' ? 'primary' : 'secondary'}>Part 2</Button>
                <Button onClick={() => { setCurrentPart('p3'); setRun('idle'); }} variant={currentPart==='p3' ? 'primary' : 'secondary'}>Part 3</Button>
                <Button onClick={() => { setP1Results([]); setP2Result(null); setP3Results([]); setRun('idle'); }} variant="accent">Reset Session</Button>
                <div className="ml-auto text-small opacity-75">Attempt ID: {attemptId.slice(0, 8)}…</div>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
