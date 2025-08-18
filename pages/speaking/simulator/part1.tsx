// pages/speaking/simulator/part1.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { AccentPicker, type Accent } from '@/components/speaking/AccentPicker';
import { useTTS } from '@/components/speaking/useTTS';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/router';
import { uploadSpeakingBlob } from '@/lib/speaking/uploadSpeakingBlob';

type Step = 'intro' | 'ask' | 'done';

const QUESTIONS = [
  "What's your full name and where are you from?",
  'Do you work or are you a student?',
  'What do you like to do in your free time?',
  'Do you prefer mornings or evenings? Why?',
  'Tell me about a place in your city you enjoy visiting.',
];

const ANSWER_MS = 15_000;

/* ---------- Auth helpers (Bearer + cookie) ---------- */
async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const { data } = await supabaseBrowser.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  const token = await getAccessToken();
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers, credentials: 'include' });
}

/* ---------- Utils ---------- */
function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function makeTempAttemptId() {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function cancelAllTTS() {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  } catch {}
}

/* ---------- Page ---------- */
export default function SpeakingSimPart1() {
  const router = useRouter();
  const [accent, setAccent] = useState<Accent>('UK');
  const [step, setStep] = useState<Step>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const tts = useTTS({ accent });

  const question = useMemo(() => QUESTIONS[qIndex] || '', [qIndex]);

  // Auth guard (redirect if not logged in)
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login?next=/speaking/simulator/part1');
    });
  }, [router]);

  const ensureAttempt = useCallback(async () => {
    if (attemptId) return attemptId;
    try {
      const r = await authedFetch('/api/speaking/start-attempt', {
        method: 'POST',
        body: JSON.stringify({ part: 'p1' }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || r.statusText);
      const id = j.id || j.attemptId;
      if (!id) throw new Error('No attempt id returned');
      setAttemptId(id);
      return id;
    } catch {
      const tempId = makeTempAttemptId();
      setAttemptId(tempId);
      return tempId;
    }
  }, [attemptId]);

  async function ensureMic() {
    if (streamRef.current) return streamRef.current;
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = s;
    return s;
  }

  async function submitAnswerBlob(blob: Blob, qIdx: number) {
    try {
      const id = await ensureAttempt();
      const path = `attempts/${id}/p1/q${qIdx + 1}-${Date.now()}.webm`;

      const { path: savedPath, clipId } = await uploadSpeakingBlob(blob, 'p1', id, path);

      const b64 = await blobToBase64(blob);
      const r = await authedFetch('/api/speaking/score-save', {
        method: 'POST',
        body: JSON.stringify({
          attemptId: id,
          part: 'p1',
          audioBase64: b64,
          mime: blob.type || 'audio/webm',
          path: savedPath || path,
          clipId,
        }),
      }).then((r) => r.json());

      setBanner(r?.advice ? `Saved — ${r.advice}` : 'Saved your response.');
    } catch {
      setBanner('Saved your response — AI unavailable now.');
    } finally {
      if (qIdx + 1 < QUESTIONS.length) {
        setQIndex(qIdx + 1);
        setStep('ask');
      } else {
        setStep('done');
      }
    }
  }

  async function speakQuestionWithFallback(qText: string, maxWaitMs = 6000) {
    cancelAllTTS();

    // try custom hook first
    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
    };

    await new Promise<void>((resolve) => {
      const fallback = window.setTimeout(() => {
        done();
        resolve();
      }, maxWaitMs);

      try {
        const maybe = (tts as any)?.speak?.(qText, {
          rate: 0.95,
          onend: () => {
            if (fallback) window.clearTimeout(fallback);
            done();
            resolve();
          },
        });

        // If tts.speak returns a Promise, await it too.
        if (maybe && typeof maybe.then === 'function') {
          (maybe as Promise<any>).finally(() => {
            if (fallback) window.clearTimeout(fallback);
            done();
            resolve();
          });
        }
      } catch {
        if (fallback) window.clearTimeout(fallback);
        done();
        resolve();
      }
    });
  }

  async function startRecordingFor15s(qIdx: number) {
    await ensureMic();
    const rec = new MediaRecorder(streamRef.current!, { mimeType: 'audio/webm' });
    mediaRecRef.current = rec;
    chunksRef.current = [];

    rec.ondataavailable = (e) => e.data && chunksRef.current.push(e.data);
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      chunksRef.current = [];
      await submitAnswerBlob(blob, qIdx);
    };

    rec.start();
    setIsRecording(true);
    setSecondsLeft(ANSWER_MS / 1000);

    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (tickRef.current) window.clearInterval(tickRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000) as unknown as number;

    stopTimerRef.current = window.setTimeout(() => {
      if (rec.state !== 'inactive') rec.stop();
      setIsRecording(false);
    }, ANSWER_MS) as unknown as number;
  }

  async function askAndAutoRecord(qText: string, qIdx: number) {
    await speakQuestionWithFallback(qText); // ← real onend OR 6s fallback
    await startRecordingFor15s(qIdx);
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
      const rec = mediaRecRef.current;
      if (rec && rec.state !== 'inactive') rec.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cancelAllTTS();
    };
  }, []);

  const start = useCallback(async () => {
    setError('');
    try {
      await ensureAttempt();
      await ensureMic(); // get user gesture + mic permission up front
      setStep('ask');
      askAndAutoRecord(QUESTIONS[0], 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to start');
    }
  }, [ensureAttempt]);

  useEffect(() => {
    if (step === 'ask' && qIndex > 0) {
      askAndAutoRecord(QUESTIONS[qIndex], qIndex);
    }
  }, [step, qIndex]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="flex items-center justify-between">
          <h1 className="font-slab text-4xl text-gradient-primary">Simulator — Part 1 (Interview)</h1>
          <Link href="/speaking/simulator">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="p-5">
            <Badge variant="info" className="mb-3">Settings</Badge>
            <AccentPicker value={accent} onChange={setAccent} />
            <div className="mt-3 text-small text-grayish">
              Each answer records for <b>15 seconds</b> automatically.
            </div>
          </Card>

          <Card className="p-5 md:col-span-2">
            {step === 'intro' && (
              <div>
                <p className="text-grayish">
                  We’ll ask one question at a time. As soon as you hear it, you’ll get <b>15 seconds</b> to answer.
                  The next question starts automatically.
                </p>
                <div className="mt-4"><Button onClick={start}>Start Part 1</Button></div>
              </div>
            )}

            {step === 'ask' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Question {qIndex + 1} / {QUESTIONS.length}</div>
                  <Badge variant="info">
                    {isRecording ? `${secondsLeft}s left` : 'Waiting…'}
                  </Badge>
                </div>
                <div className="rounded-ds border border-gray-200 dark:border-white/10 p-4 mb-3">
                  {question}
                </div>
                <div className="text-small">{isRecording ? 'Recording…' : 'Mic idle'}</div>
              </div>
            )}

            {step === 'done' && (
              <div>
                <Alert variant="success" title="Part 1 completed">
                  Nice work! Continue to Part 2 for the cue-card task.
                </Alert>
                <div className="mt-4 flex gap-3">
                  <Link href="/speaking/simulator/part2"><Button>Go to Part 2</Button></Link>
                  <Link href="/speaking/simulator"><Button variant="secondary">Back</Button></Link>
                </div>
              </div>
            )}

            {banner && <Alert variant="info">{banner}</Alert>}
            {error && <Alert variant="error" title="Something went wrong">{error}</Alert>}
            {busy && !error && <div className="mt-3 text-small text-grayish">Saving…</div>}
          </Card>
        </div>
      </Container>
    </section>
  );
}
