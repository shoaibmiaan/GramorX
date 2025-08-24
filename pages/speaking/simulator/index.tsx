import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { GradientText } from '@/components/design-system/GradientText';

/* ======= simple TTS (no external deps) ======= */
function speak(text: string, opts?: SpeechSynthesisUtteranceInit) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const v =
    window.speechSynthesis.getVoices().find((x) => /en-(GB|US|AU)/i.test(String(x.lang))) ||
    window.speechSynthesis.getVoices()[0];
  if (v) u.voice = v;
  Object.assign(u, opts);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ======= upload helper (signed-url → multipart fallbacks) ======= */
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
      if (data.uploadUrl && data.publicUrl) {
        await putSigned(data.uploadUrl, file, data.headers);
        return { fileUrl: data.publicUrl };
      }
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

/* ======= evaluate helper (saves clip + returns AI feedback) ======= */
async function evaluateClip(attemptId: string, ctx: 'p1'|'p2'|'p3', audioUrl: string, qIndex?: number) {
  const r = await fetch('/api/speaking/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // cookies carry auth; no custom headers needed
    body: JSON.stringify({ attemptId, ctx, audioUrl, qIndex }),
  });
  if (!r.ok) throw new Error('Evaluate failed');
  const { feedback } = await r.json();
  return feedback as { band?: number; summary?: string; aspects?: Array<{ key: 'fluency'|'lexical'|'grammar'|'pronunciation'; band: number; note?: string }> };
}

/* ======= tiny recorder (MediaRecorder) ======= */
async function recordFor(ms: number): Promise<Blob> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<Blob>((resolve) => (rec.onstop = () => {
    stream.getTracks().forEach((t) => t.stop());
    resolve(new Blob(chunks, { type: 'audio/webm' }));
  }));
  rec.start();
  await sleep(ms);
  rec.stop();
  return done;
}

/* ======= constants + local prompt banks ======= */
const DUR = {
  p1AskMs: 1000,
  p1SpeakMs: 15000,    // 15s
  p2PrepMs: 60000,     // 60s
  p2SpeakMs: 120000,   // 120s
  p3PerAnswer: 40000,  // 40s
};
const P1_QUESTIONS = [
  'Do you work or study?',
  'What do you like most about your hometown?',
  'How often do you read books?',
  'Do you prefer mornings or evenings?',
  'What is a skill you want to learn, and why?',
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

/* ======= page ======= */
type PartKey = 'p1'|'p2'|'p3';
type RunState = 'idle'|'asking'|'recording'|'uploading'|'review';

export default function SpeakingSimulator() {
  const [micReady, setMicReady] = useState(false);
  const [part, setPart] = useState<PartKey>('p1');
  const [run, setRun] = useState<RunState>('idle');
  const [attemptId] = useState<string>(() => (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`));

  const [qIndex, setQIndex] = useState(0);
  const [prepLeft, setPrepLeft] = useState(0);
  const [recordLeft, setRecordLeft] = useState(0);
  const [recordTotal, setRecordTotal] = useState(0);

  const [p1, setP1] = useState<Array<{ url?: string; fb?: any }>>([]);
  const [p2, setP2] = useState<{ url?: string; fb?: any } | null>(null);
  const [p3, setP3] = useState<Array<{ url?: string; fb?: any }>>([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((s) => { s.getTracks().forEach(t=>t.stop()); setMicReady(true); })
      .catch(() => setMicReady(false));
  }, []);

  // countdown helpers
  const startCountdown = useCallback(async (ms: number, setter: (n:number)=>void) => {
    const start = Date.now();
    setter(ms);
    while (Date.now() - start < ms) {
      await sleep(250);
      setter(Math.max(0, ms - (Date.now() - start)));
    }
  }, []);

  // beeps before Part 2 speaking
  async function tripleBeep() {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const beep = async (freq=880) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = freq; o.type='sine'; g.gain.value = 0.08;
      o.connect(g); g.connect(ctx.destination); o.start(); await sleep(180); o.stop();
    };
    await beep(660); await sleep(200); await beep(660); await sleep(200); await beep(880);
    await ctx.close();
  }

  // shared “record ms” with visual timer
  const timedRecord = useCallback(async (ms: number) => {
    setRecordTotal(ms);
    setRecordLeft(ms);
    const tick = setInterval(()=>setRecordLeft((x)=>Math.max(0, x-200)), 200);
    const blob = await recordFor(ms);
    clearInterval(tick);
    return blob;
  }, []);

  // flows
  const runP1 = useCallback(async () => {
    setRun('asking');
    const out: Array<{ url?: string; fb?: any }> = [];
    for (let i = 0; i < P1_QUESTIONS.length; i++) {
      setQIndex(i);
      speak(P1_QUESTIONS[i], { rate: 1 });
      await sleep(DUR.p1AskMs);
      setRun('recording');
      const blob = await timedRecord(DUR.p1SpeakMs);
      setRun('uploading');
      const file = new File([blob], `p1_${attemptId}_${i}.webm`, { type: 'audio/webm' });
      const { fileUrl } = await uploadAudio(file);
      const fb = await evaluateClip(attemptId, 'p1', fileUrl, i);
      out.push({ url: fileUrl, fb });
      setRun('asking');
      await sleep(600);
    }
    setP1(out);
    setRun('review');
  }, [attemptId, timedRecord]);

  const runP2 = useCallback(async () => {
    setRun('asking');
    speak('Part two. You have one minute to prepare. Then speak for up to two minutes.', { rate: 0.95 });
    speak(P2_CUE, { rate: 1 });
    await startCountdown(DUR.p2PrepMs, setPrepLeft);
    await tripleBeep();

    setRun('recording');
    const blob = await timedRecord(DUR.p2SpeakMs);
    setRun('uploading');
    const file = new File([blob], `p2_${attemptId}.webm`, { type: 'audio/webm' });
    const { fileUrl } = await uploadAudio(file);
    const fb = await evaluateClip(attemptId, 'p2', fileUrl, 0);
    setP2({ url: fileUrl, fb });
    setRun('review');
  }, [attemptId, startCountdown, timedRecord]);

  const runP3 = useCallback(async () => {
    setRun('asking');
    const out: Array<{ url?: string; fb?: any }> = [];
    for (let i = 0; i < P3_QUESTIONS.length; i++) {
      setQIndex(i);
      speak(P3_QUESTIONS[i], { rate: 1 });
      await sleep(DUR.p1AskMs);
      setRun('recording');
      const blob = await timedRecord(DUR.p3PerAnswer);
      setRun('uploading');
      const file = new File([blob], `p3_${attemptId}_${i}.webm`, { type: 'audio/webm' });
      const { fileUrl } = await uploadAudio(file);
      const fb = await evaluateClip(attemptId, 'p3', fileUrl, i);
      out.push({ url: fileUrl, fb });
      setRun('asking');
      await sleep(600);
    }
    setP3(out);
    setRun('review');
  }, [attemptId, timedRecord]);

  const fmt = (ms: number) => {
    const s = Math.ceil(ms/1000), m = Math.floor(s/60), r = s % 60;
    return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
  };

  return (
    <>
      <Head><title>Speaking Simulator | IELTS Portal</title></Head>
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 className="font-slab text-h1"><GradientText>Speaking Simulator</GradientText></h1>
            <Badge variant={micReady ? 'success' : 'danger'}>{micReady ? 'Mic ready' : 'Mic blocked'}</Badge>
          </div>

          <div className="grid gap-6">
            {/* tabs */}
            <Card className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => { setPart('p1'); setRun('idle'); }} variant={part==='p1' ? 'primary' : 'secondary'}>Part 1</Button>
                <Button onClick={() => { setPart('p2'); setRun('idle'); }} variant={part==='p2' ? 'primary' : 'secondary'}>Part 2</Button>
                <Button onClick={() => { setPart('p3'); setRun('idle'); }} variant={part==='p3' ? 'primary' : 'secondary'}>Part 3</Button>
                <Button as="a" href="/speaking" variant="secondary" className="ml-auto">Back to Speaking</Button>
              </div>
            </Card>

            {/* Part 1 */}
            {part === 'p1' && (
              <Card className="p-6 rounded-ds-2xl">
                <h2 className="text-h3 mb-1">Part 1 — Interview</h2>
                <p className="text-grayish mb-4">Introductory questions • 15 seconds per answer</p>

                {run === 'idle' && (
                  <Alert title="Ready to start Part 1?">
                    You will answer {P1_QUESTIONS.length} short questions. Recording will auto-start after each question.
                    <div className="mt-4 flex gap-3">
                      <Button onClick={runP1} variant="primary" disabled={!micReady}>Start Part 1</Button>
                      <Button onClick={() => setPart('p2')} variant="secondary">Skip to Part 2</Button>
                    </div>
                  </Alert>
                )}

                {run === 'asking' && (
                  <Card className="p-4">
                    <Badge>Question {qIndex + 1} of {P1_QUESTIONS.length}</Badge>
                    <p className="mt-2 text-lg">{P1_QUESTIONS[qIndex]}</p>
                    <p className="text-sm text-grayish mt-2">Listening… recording will start automatically.</p>
                  </Card>
                )}

                {run === 'recording' && (
                  <Card className="p-6 text-center rounded-ds-2xl">
                    <Badge variant="warning">Recording…</Badge>
                    <div className="mt-3 font-mono text-4xl">
                      {fmt(recordLeft)} <span className="opacity-60 text-lg">/ {fmt(recordTotal)}</span>
                    </div>
                  </Card>
                )}

                {run === 'uploading' && <Alert variant="info" title="Uploading answer…">Please wait a moment.</Alert>}

                {(run === 'review' || p1.length > 0) && (
                  <div className="mt-6 grid gap-4">
                    {p1.map((r, i) => (
                      <Card key={i} className="p-4">
                        <div className="flex items-center justify-between">
                          <Badge>Question {i + 1}</Badge>
                          {r.url && <audio src={r.url} controls className="w-56" />}
                        </div>
                        {r.fb && (
                          <div className="mt-3">
                            <Badge variant={r.fb.band >= 7 ? 'success' : r.fb.band >= 6 ? 'warning' : 'danger'}>
                              Band {r.fb.band?.toFixed(1)}
                            </Badge>
                            {r.fb.summary && <p className="mt-2">{r.fb.summary}</p>}
                          </div>
                        )}
                      </Card>
                    ))}
                    {run === 'review' && (
                      <div className="flex gap-3">
                        <Button onClick={() => { setP1([]); setQIndex(0); setRun('idle'); }} variant="secondary">Retry Part 1</Button>
                        <Button onClick={() => { setPart('p2'); setRun('idle'); }} variant="primary">Next: Part 2</Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Part 2 */}
            {part === 'p2' && (
              <Card className="p-6 rounded-ds-2xl">
                <h2 className="text-h3 mb-1">Part 2 — Cue Card</h2>
                <p className="text-grayish mb-4">1 minute prep → 2 minutes speaking</p>

                {run === 'idle' && (
                  <Alert title="Ready to start Part 2?">
                    You’ll see your cue card. You have 1 minute to prepare. Then a 3-beep countdown and 2 minutes to speak.
                    <div className="mt-4 flex gap-3">
                      <Button onClick={runP2} variant="primary" disabled={!micReady}>Start Part 2</Button>
                      <Button onClick={() => setPart('p1')} variant="secondary">Back to Part 1</Button>
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
                          {prepLeft > 0 ? <>You have <b>{Math.ceil(prepLeft/1000)}</b> seconds to prepare…</> : 'Get ready…'}
                        </Alert>
                      )}
                      {run === 'recording' && (
                        <Card className="p-6 text-center rounded-ds-2xl">
                          <Badge variant="warning">Recording…</Badge>
                          <div className="mt-3 font-mono text-4xl">
                            {fmt(recordLeft)} <span className="opacity-60 text-lg">/ {fmt(recordTotal)}</span>
                          </div>
                        </Card>
                      )}
                      {run === 'uploading' && <Alert variant="info" title="Uploading answer…">Please wait.</Alert>}
                      {run === 'review' && p2 && (
                        <div>
                          <div className="flex items-center justify-between">
                            <Badge>Part 2 — Your answer</Badge>
                            {p2.url && <audio src={p2.url} controls className="w-56" />}
                          </div>
                          {p2.fb && (
                            <div className="mt-3">
                              <Badge variant={p2.fb.band >= 7 ? 'success' : p2.fb.band >= 6 ? 'warning' : 'danger'}>
                                Band {p2.fb.band?.toFixed(1)}
                              </Badge>
                              {p2.fb.summary && <p className="mt-2">{p2.fb.summary}</p>}
                            </div>
                          )}
                          <div className="mt-4 flex gap-3">
                            <Button onClick={() => { setP2(null); setRun('idle'); }} variant="secondary">Retry Part 2</Button>
                            <Button onClick={() => { setPart('p3'); setRun('idle'); }} variant="primary">Next: Part 3</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Part 3 */}
            {part === 'p3' && (
              <Card className="p-6 rounded-ds-2xl">
                <h2 className="text-h3 mb-1">Part 3 — Discussion</h2>
                <p className="text-grayish mb-4">Follow-up questions • 40 seconds per answer</p>

                {run === 'idle' && (
                  <Alert title="Ready to start Part 3?">
                    You will answer {P3_QUESTIONS.length} discussion questions. Recording will auto-start after each question.
                    <div className="mt-4 flex gap-3">
                      <Button onClick={runP3} variant="primary" disabled={!micReady}>Start Part 3</Button>
                      <Button onClick={() => setPart('p2')} variant="secondary">Back to Part 2</Button>
                    </div>
                  </Alert>
                )}

                {run === 'asking' && (
                  <Card className="p-4">
                    <Badge>Question {qIndex + 1} of {P3_QUESTIONS.length}</Badge>
                    <p className="mt-2 text-lg">{P3_QUESTIONS[qIndex]}</p>
                    <p className="text-sm text-grayish mt-2">Listening… recording will start automatically.</p>
                  </Card>
                )}

                {run === 'recording' && (
                  <Card className="p-6 text-center rounded-ds-2xl">
                    <Badge variant="warning">Recording…</Badge>
                    <div className="mt-3 font-mono text-4xl">
                      {fmt(recordLeft)} <span className="opacity-60 text-lg">/ {fmt(recordTotal)}</span>
                    </div>
                  </Card>
                )}

                {run === 'uploading' && <Alert variant="info" title="Uploading answer…">Please wait.</Alert>}

                {(run === 'review' || p3.length > 0) && (
                  <div className="mt-6 grid gap-4">
                    {p3.map((r, i) => (
                      <Card key={i} className="p-4">
                        <div className="flex items-center justify-between">
                          <Badge>Question {i + 1}</Badge>
                          {r.url && <audio src={r.url} controls className="w-56" />}
                        </div>
                        {r.fb && (
                          <div className="mt-3">
                            <Badge variant={r.fb.band >= 7 ? 'success' : r.fb.band >= 6 ? 'warning' : 'danger'}>
                              Band {r.fb.band?.toFixed(1)}
                            </Badge>
                            {r.fb.summary && <p className="mt-2">{r.fb.summary}</p>}
                          </div>
                        )}
                      </Card>
                    ))}
                    {run === 'review' && (
                      <div className="flex gap-3">
                        <Button onClick={() => { setP3([]); setQIndex(0); setRun('idle'); }} variant="secondary">Retry Part 3</Button>
                        <Button as="a" href="/dashboard" variant="primary">Finish & Go to Dashboard</Button>
                        <Button as="a" href="/speaking" variant="accent">More Speaking Practice</Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Deep links */}
            <Card className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button as="a" href="/speaking/partner" variant="secondary">AI Partner</Button>
                <Button as="a" href="/speaking/roleplay/hotel-check-in" variant="secondary">Role-play</Button>
                <Button as="a" href="/speaking/attempts" variant="secondary">Attempts</Button>
              </div>
            </Card>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/speaking" className="underline opacity-80 hover:opacity-100">Speaking Hub</Link>
            <span className="opacity-40">·</span>
            <Link href="/speaking/practice" className="underline opacity-80 hover:opacity-100">Targeted Practice</Link>
          </div>
        </Container>
      </section>
    </>
  );
}
