// pages/speaking/simulator/part2.tsx
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { AccentPicker, Accent } from '@/components/speaking/AccentPicker';
import { speakingP2, type CueCard } from '@/lib/speaking/promptBank';
import { uploadSpeakingBlob } from '@/lib/speaking/uploadSpeakingBlob';
import { useTTS } from '@/components/speaking/useTTS';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/router';

const Recorder = dynamic(async () => {
  const m = await import('@/components/speaking/Recorder');
  return (m as any).Recorder ?? (m as any).default;
}, { ssr: false });

type Step = 'intro'|'prep'|'record'|'review';

export default function SpeakingSimPart2() {
  const [accent, setAccent] = useState<Accent>('UK');
  const [step, setStep] = useState<Step>('intro');
  const [card, setCard] = useState<CueCard | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [prepLeft, setPrepLeft] = useState(60);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login?next=/speaking/simulator');
    });
  }, [router]);

  // Recorder support check
  const supported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!(navigator.mediaDevices && (window as any).MediaRecorder);
  }, []);

  const tts = useTTS({ accent });

  const start = useCallback(() => {
    setResult(null); setError('');
    const c = speakingP2[Math.floor(Math.random() * speakingP2.length)];
    setCard(c);
    setPrompt(`${c.task}\nYou should say:\n- ${c.bullets.join('\n- ')}`);
    setPrepLeft(60);
    setStep('prep');
  }, []);

  useEffect(() => {
    if (step !== 'prep' || !card) return;
    tts.cancel();
    tts.speakSequence([
      "Now I'm going to give you a topic. You have one minute to prepare.",
      card.task,
      "You should say:",
      ...card.bullets
    ], 200, { accent });
  }, [step, card, accent, tts]);

  useEffect(() => {
    if (step !== 'prep' || prepLeft <= 0) return;
    const id = window.setInterval(() => setPrepLeft(s => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [step, prepLeft]);

  const beginSpeaking = useCallback(() => setStep('record'), []);

  const onSubmit = useCallback(async (blob: Blob, durationMs: number) => {
    try {
      setBusy(true);
      const { attemptId } = await uploadSpeakingBlob(blob, 'p2', { durationMs, prompt, accent });
      const { authHeaders } = await import('@/lib/supabaseBrowser');
      const headers = await authHeaders({ 'Content-Type': 'application/json' } as any);
      const r = await fetch('/api/speaking/evaluate', { method: 'POST', headers, body: JSON.stringify({ attemptId }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Evaluation failed');
      setResult(data);
      setStep('review');
    } catch (e:any) {
      setError(e?.message || 'Failed to process attempt');
    } finally { setBusy(false); }
  }, [prompt, accent]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="flex items-center justify-between">
          <h1 className="font-slab text-4xl text-gradient-primary">Simulator — Part 2 (Cue Card)</h1>
          <Link href="/speaking/simulator">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="p-5">
            <Badge variant="info" className="mb-3">Settings</Badge>
            <AccentPicker value={accent} onChange={setAccent} />
            <div className="mt-4">
              <Button onClick={() => prompt && tts.speak(prompt, { accent })} variant="secondary">Speak task again</Button>
            </div>
          </Card>

          <Card className="p-5 md:col-span-2">
            {step === 'intro' && (
              <div>
                <p className="text-grayish">1-minute prep → 3-beep → auto-record 2 min. Stop → Submit or Retry. No evaluation if ≤ 60s.</p>
                <div className="mt-4"><Button onClick={start}>Start Part 2</Button></div>
              </div>
            )}

            {step === 'prep' && card && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Prepare (1 minute)</div>
                  <Badge variant={prepLeft > 0 ? 'warning' : 'success'}>{prepLeft > 0 ? `${prepLeft}s` : 'Ready'}</Badge>
                </div>
                <div className="rounded-ds border border-gray-200 dark:border-white/10 p-4">
                  <div className="opacity-80 mb-1">Topic:</div>
                  <div className="font-semibold mb-2">{card.topic}</div>
                  <div className="opacity-80 mb-1">Task:</div>
                  <div className="mb-2">{card.task}</div>
                  <div className="opacity-80 mb-1">You should say:</div>
                  <ul className="list-disc pl-5">{card.bullets.map((b,i)=><li key={i}>{b}</li>)}</ul>
                </div>
                <div className="mt-4"><Button onClick={beginSpeaking} disabled={prepLeft > 0}>Begin speaking</Button></div>
              </div>
            )}

            {step === 'record' && (
              <div>
                <div className="mb-3">
                  <div className="text-small opacity-80">Your task</div>
                  <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10 whitespace-pre-line">{prompt}</div>
                </div>

                {supported ? (
                  <Recorder
                    maxSeconds={120}
                    autoStart
                    startDelayMs={3000}
                    beepBeforeStart
                    deferredSubmit
                    minSubmitMs={60_000}
                    onComplete={onSubmit}
                    onDiscard={() => setStep('record')}
                  />
                ) : (
                  <div className="rounded-ds border border-red-200/70 dark:border-red-400/30 p-4">
                    <p className="font-medium text-red-600 dark:text-red-400">Microphone not available.</p>
                    <ul className="list-disc pl-5 text-sm mt-2 opacity-80">
                      <li>Allow mic access for <code>localhost</code>.</li>
                      <li>Browser settings → Microphone → Allow.</li>
                      <li>Disable Brave Shields (if using Brave).</li>
                    </ul>
                    <div className="mt-3">
                      <Button variant="secondary" onClick={() => location.reload()}>Retry</Button>
                    </div>
                  </div>
                )}

                <p className="text-small text-grayish mt-2">
                  Recording starts automatically after the 3-beep. Speak close to 2 minutes for best evaluation.
                </p>
              </div>
            )}

            {step === 'review' && result && (
              <div>
                <Alert variant="success" title="Evaluation ready">
                  Overall band: <b>{result.band_overall}</b>
                </Alert>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="p-4">
                    <div className="font-semibold mb-2">Band breakdown</div>
                    <ul className="list-disc pl-5">
                      <li>Fluency: {result.bands.fluency}</li>
                      <li>Coherence: {result.bands.coherence}</li>
                      <li>Lexical: {result.bands.lexical}</li>
                      <li>Grammar: {result.bands.grammar}</li>
                      <li>Pronunciation: {result.bands.pronunciation}</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <div className="font-semibold mb-2">Tips</div>
                    <ul className="list-disc pl-5">{result.tips.map((t:string,i:number)=><li key={i}>{t}</li>)}</ul>
                  </Card>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button onClick={start} disabled={busy}>Try another card</Button>
                  <Link href="/speaking/simulator/part3">
                    <Button variant="secondary">Go to Part 3</Button>
                  </Link>
                </div>
              </div>
            )}

            {error && <Alert variant="error" title="Something went wrong">{error}</Alert>}
          </Card>
        </div>
      </Container>
    </section>
  );
}
