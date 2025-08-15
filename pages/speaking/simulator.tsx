import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container } from '../../components/design-system/Container';
import { Card } from '../../components/design-system/Card';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { useSpeech } from '../../components/speaking/useSpeech'; // your existing hook

type PartKey = 'p1' | 'p2' | 'p3';
type Stage = 'intro' | 'run' | 'done';

const QUESTIONS: Record<PartKey, string[]> = {
  p1: [
    "What's your full name and where are you from?",
    'Do you work or are you a student?',
    'What do you like to do in your free time?',
    'Do you prefer mornings or evenings? Why?',
    'Tell me about a place in your city you enjoy visiting.',
  ],
  p2: [
    'Describe a book that influenced you and explain why.',
    'Describe a person who inspires you and how they influenced your life.',
    'Describe a memorable trip you took and what made it special.',
    'Describe a useful app or website you often use and why.',
    'Describe a challenge you faced and how you overcame it.',
  ],
  p3: [
    'How has technology changed the way we communicate?',
    'Should schools focus more on creativity or discipline? Why?',
    'What factors influence career choices for young people today?',
    'Do you think cities should limit car use? Explain.',
    'How important is it to preserve cultural traditions in a globalized world?',
  ],
};

const PER_QUESTION_SECONDS = 30;
const QUESTIONS_PER_PART = 5;

/* ====================== AUTH (Bearer + cookie) ====================== */
async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const mod = await import('../../lib/supabaseBrowser');
    const sb =
      (mod as any)?.default ??
      (mod as any)?.supabaseBrowser ??
      (mod as any)?.supabase ??
      (mod as any)?.client ??
      (mod as any)?.browser ??
      null;
    if (sb?.auth?.getSession) {
      const { data } = await sb.auth.getSession();
      const tok = data?.session?.access_token || null;
      if (tok) return tok;
    }
  } catch {}

  try {
    const mod = await import('../../lib/supabaseClient');
    const sb = (mod as any)?.default ?? (mod as any)?.supabase ?? (mod as any)?.client ?? null;
    if (sb?.auth?.getSession) {
      const { data } = await sb.auth.getSession();
      const tok = data?.session?.access_token || null;
      if (tok) return tok;
    }
  } catch {}

  try {
    const key = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
    if (key) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const obj = JSON.parse(raw);
        const tok = obj?.access_token ?? obj?.currentSession?.access_token ?? null;
        if (tok) return tok;
      }
    }
  } catch {}
  return null;
}

async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  const token = await getAccessToken();
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers, credentials: 'include' });
}
async function authedForm(input: RequestInfo | URL, form: FormData, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {}); // keep boundary auto
  const token = await getAccessToken();
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, method: 'POST', headers, body: form, credentials: 'include' });
}

/* ====================== Media helpers ====================== */
function pickMime(): string | undefined {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
  for (const c of candidates) {
    if ((window as any).MediaRecorder?.isTypeSupported?.(c)) return c;
  }
  return undefined;
}
function blobToBase64(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => {
      const dataUrl = r.result as string; // "data:audio/webm;base64,AAAA..."
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve(base64);
    };
    r.onerror = reject;
    r.readAsDataURL(b);
  });
}

/* ====================== Page ====================== */
export default function SpeakingSimulator() {
  const [stage, setStage] = useState<Stage>('intro');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startErr, setStartErr] = useState<string | null>(null);

  const [part, setPart] = useState<PartKey>('p1');
  const [qIndex, setQIndex] = useState(0);

  const [status, setStatus] = useState<'idle' | 'asking' | 'recording' | 'saving' | 'completed'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(PER_QUESTION_SECONDS);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);

  const { speak } = useSpeech('Default' as any);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const tickRef = useRef<number | null>(null);

  const currentQuestion = useMemo(() => QUESTIONS[part][qIndex] || '', [part, qIndex]);
  const partTitle = useMemo(
    () => (part === 'p1' ? 'Part 1 — Introduction & Interview' : part === 'p2' ? 'Part 2 — Long Turn' : 'Part 3 — Discussion'),
    [part]
  );

  const ensureAttempt = useCallback(async (): Promise<string | null> => {
    try {
      setStartErr(null);
      const r = await authedFetch('/api/speaking/start-attempt', {
        method: 'POST',
        body: JSON.stringify({ mode: 'simulator' }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || r.statusText);
      const id = j.id || j.attemptId;
      setAttemptId(id);
      return id;
    } catch (e: any) {
      setStartErr(e?.message || 'Failed to start attempt');
      return null;
    }
  }, []);
  useEffect(() => { if (stage === 'intro') void ensureAttempt(); }, [stage, ensureAttempt]);

  useEffect(() => {
    return () => {
      try {
        if (tickRef.current) window.clearInterval(tickRef.current);
        recorderRef.current?.stop();
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
    };
  }, []);

  const askAndRecord = useCallback(async () => {
    setError(null);
    setFeedback(null);
    setLastAudioUrl(null);
    setStatus('asking');

    let id = attemptId;
    if (!id) {
      id = await ensureAttempt();
      if (!id) {
        setError('Attempt not initialized. Please try again.');
        setStatus('idle');
        return;
      }
    }

    try { if (currentQuestion) await speak(currentQuestion); } catch {}

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = pickMime();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = rec;
      chunksRef.current = [];
      setSecondsLeft(PER_QUESTION_SECONDS);
      setStatus('recording');

      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setLastAudioUrl(url);
          await handleSave(blob);
        } catch (e: any) {
          setError(e?.message || 'Failed to save.');
          setStatus('idle');
        } finally {
          try { mediaStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
          mediaStreamRef.current = null;
        }
      };

      rec.start();
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          const n = s - 1;
          if (n <= 0) {
            if (tickRef.current) window.clearInterval(tickRef.current);
            try { rec.stop(); } catch {}
            return 0;
          }
          return n;
        });
        return;
      }, 1000) as unknown as number;
    } catch (e: any) {
      setError(e?.message || 'Microphone access failed.');
      setStatus('idle');
    }
  }, [attemptId, ensureAttempt, speak, currentQuestion]);

  const submitEarly = useCallback(() => {
    if (status !== 'recording') return;
    try {
      if (tickRef.current) window.clearInterval(tickRef.current);
      recorderRef.current?.stop();
    } catch {}
  }, [status]);

  const handleSave = useCallback(
    async (blob: Blob) => {
      if (!attemptId) throw new Error('Attempt missing');
      setStatus('saving');
      setError(null);

      // 1) Upload (keeps file + DB)
      const fd = new FormData();
      fd.append('file', blob, `${part}-q${qIndex + 1}-${Date.now()}.webm`);
      fd.append('attemptId', attemptId);
      fd.append('context', part);

      const up = await authedForm('/api/speaking/upload', fd);
      let upJson: any = {};
      try { upJson = await up.json(); } catch {}
      if (!up.ok) {
        setStatus('idle');
        throw new Error(`${upJson?.error || 'upload failed'} [${up.status}]`);
      }

      // 2) Send inline base64 to AI evaluator
      const audioBase64 = await blobToBase64(blob);
      const payload = {
        attemptId,
        part,                      // MUST be 'p1' | 'p2' | 'p3'
        audioBase64,               // what your API error message asked for
        mime: blob.type || 'audio/webm',
        // optional helpers if your route wants them:
        path: upJson?.path ?? upJson?.filePath ?? upJson?.url ?? null,
        clipId: upJson?.clipId ?? upJson?.clip_id ?? upJson?.id ?? null,
      };

      const ss = await authedFetch('/api/speaking/score-save', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      let ssJson: any = {};
      try { ssJson = await ss.json(); } catch {}

      if (!ss.ok) {
        const reason = ssJson?.error || ss.statusText || 'AI feedback unavailable';
        setFeedback(`Saved your response. — ${reason}`);
        setStatus('completed');
        return;
      }

      let msg = 'Saved your response.';
      const sc = ssJson?.scores as { overall?: number } | undefined;
      const adv = typeof ssJson?.advice === 'string' ? ssJson.advice.trim() : null;
      if (sc?.overall || adv) {
        const hint = sc?.overall ? `Band hint: ${sc.overall}` : '';
        msg = [hint, adv].filter(Boolean).join(' — ');
      }
      setFeedback(msg);
      setStatus('completed');
    },
    [attemptId, part, qIndex]
  );

  const next = useCallback(() => {
    if (qIndex + 1 < QUESTIONS_PER_PART) {
      setQIndex(qIndex + 1);
      setSecondsLeft(PER_QUESTION_SECONDS);
      setStatus('idle');
      setFeedback(null);
      setError(null);
    } else {
      if (part === 'p1') { setPart('p2'); setQIndex(0); setStatus('idle'); setFeedback(null); setError(null); }
      else if (part === 'p2') { setPart('p3'); setQIndex(0); setStatus('idle'); setFeedback(null); setError(null); }
      else { setStage('done'); }
    }
  }, [qIndex, part]);

  useEffect(() => {
    if (stage === 'run' && status === 'idle') {
      const t = window.setTimeout(() => { askAndRecord(); }, 250);
      return () => window.clearTimeout(t);
    }
  }, [stage, status, part, qIndex, askAndRecord]);

  const startTest = useCallback(async () => {
    let id = attemptId;
    if (!id) id = await ensureAttempt();
    if (!id) { setError('Could not create attempt.'); return; }
    setStage('run');
    setPart('p1');
    setQIndex(0);
    setSecondsLeft(PER_QUESTION_SECONDS);
    setStatus('idle');
    setFeedback(null);
    setError(null);
  }, [attemptId, ensureAttempt]);

  const finishAndScore = useCallback(async () => {
    if (!attemptId) return;
    try {
      const r = await authedFetch('/api/speaking/score', { method: 'POST', body: JSON.stringify({ attemptId }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Failed to score');
      const msg =
        j?.overall != null
          ? `Overall Band: ${j.overall}\nTranscript saved to attempt.`
          : `Overall Band: — (reason: ${j?.source || 'unknown'})\nTranscript ${j?.transcript ? 'saved' : 'not available'}.`;
      alert(msg);
    } catch (e: any) {
      alert(`Aggregate score error: ${e?.message || 'Unknown error'}`);
    }
  }, [attemptId]);

  return (
    <Container className="py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-semibold">Speaking Test Simulator</h1>
        {stage === 'run' && <Badge variant="outline">{part === 'p1' ? '1 / 3' : part === 'p2' ? '2 / 3' : '3 / 3'}</Badge>}
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-8">One part at a time with auto timer and instant feedback.</p>

      {stage === 'intro' && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-3">Instructions</h2>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>There are 3 parts. Each part contains 5 questions.</li>
            <li>Each question allows up to <strong>30 seconds</strong> to respond.</li>
            <li>Questions are read aloud automatically. Recording starts immediately.</li>
            <li>You may <em>Submit now</em> to stop early; your answer is saved and evaluated instantly.</li>
            <li>At the end we’ll compute your overall band.</li>
          </ul>
          {startErr && (
            <div className="mb-4 rounded-xl px-4 py-3 bg-red-500/10 text-red-600 dark:text-red-300">
              Couldn’t start attempt: {startErr}
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={startTest}>Start Test</Button>
            <Button variant="secondary" onClick={() => (window.location.href = '/speaking')}>Exit</Button>
          </div>
        </Card>
      )}

      {stage === 'run' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">{partTitle}</h2>
            <Badge variant="subtle">Question {qIndex + 1} / {QUESTIONS_PER_PART}</Badge>
          </div>

          <div className="mb-3 text-lg">{currentQuestion}</div>

          <div className="mb-4 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
              style={{ width: `${(100 * (PER_QUESTION_SECONDS - secondsLeft)) / PER_QUESTION_SECONDS}%` }}
            />
          </div>
          <div className="text-sm opacity-75 mb-4">
            {status === 'recording' ? `Recording… ${secondsLeft}s left` : status === 'saving' ? 'Saving…' : ''}
          </div>

          {error && <div className="mb-4 rounded-xl px-4 py-3 bg-red-500/10 text-red-600 dark:text-red-300">{error}</div>}

          {feedback && (
            <div className="mb-4 rounded-xl px-4 py-3 bg-gradient-to-r from-sky-800/30 to-indigo-800/30 text-white/90">
              <div className="font-semibold">Quick feedback</div>
              <div className="whitespace-pre-wrap">{feedback}</div>
            </div>
          )}

          {lastAudioUrl && (
            <div className="mb-4">
              <audio controls src={lastAudioUrl} className="w-full" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={submitEarly} disabled={status !== 'recording'} variant="secondary">Submit now</Button>
            <Button onClick={next} disabled={status !== 'completed'}>
              {qIndex + 1 < QUESTIONS_PER_PART ? 'Next question' : part === 'p3' ? 'Finish' : 'Next part'}
            </Button>
            <Button variant="secondary" onClick={() => setStage('intro')}>Back to instructions</Button>
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Tip: Ensure microphone permission is granted. Recording starts automatically after the question is read.
          </p>
        </Card>
      )}

      {stage === 'done' && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-3">All parts completed!</h2>
          <p className="mb-4">We’ll now compute your overall band based on your responses.</p>
          <div className="flex items-center gap-3">
            <Button onClick={finishAndScore}>Finish & Get overall score</Button>
            <Button variant="secondary" onClick={() => (window.location.href = '/speaking')}>Exit</Button>
          </div>
        </Card>
      )}
    </Container>
  );
}
