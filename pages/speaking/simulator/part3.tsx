// pages/speaking/simulator/part3.tsx
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { AccentPicker, Accent } from '@/components/speaking/AccentPicker';
import { speakingP3 } from '@/lib/speaking/promptBank';
import { uploadSpeakingBlob } from '@/lib/speaking/uploadSpeakingBlob';
import { useTTS } from '@/components/speaking/useTTS';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/router';

const Recorder = dynamic(async () => {
  const m = await import('@/components/speaking/Recorder');
  return (m as any).Recorder ?? (m as any).default;
}, { ssr: false });

type Step = 'intro'|'record'|'review';

export default function SpeakingSimPart3() {
  const [accent, setAccent] = useState<Accent>('UK');
  const [step, setStep] = useState<Step>('intro');
  const [prompt, setPrompt] = useState<string>('');
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
    const shuffled = [...speakingP3].sort(() => Math.random() - 0.5);
    const three = shuffled.slice(0, 3);
    const text = three.map((q, i) => `${i + 1}. ${q}`).join('\n');
    setPrompt(text);
    setStep('record');
  }, []);

  useEffect(() => {
    if (step === 'record' && prompt) {
      tts.cancel();
      const lines = prompt.split('\n').map(l => l.replace(/^\d+\.\s*/,'').trim());
      tts.speakSequence(lines, 300, { accent });
    }
  }, [step, prompt, accent, tts]);

  const onComplete = useCallback(async (blob: Blob, durationMs: number) => {
    try {
      setBusy(true);
      const { attemptId } = await uploadSpeakingBlob(blob, 'p3', { durationMs, prompt, accent });
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
          <h1 className="font-slab text-4xl text-gradient-primary">Simulator — Part 3</h1>
          <Link href="/speaking/simulator">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="p-5">
            <Badge variant="info" className="mb-3">Settings</Badge>
            <AccentPicker value={accent} onChange={setAccent} />
            <div className="mt-4">
              <Button onClick={() => prompt && tts.speakSequence(prompt.split('\n'), 250, { accent })} variant="secondary">
                Speak questions again
              </Button>
            </div>
          </Card>

          <Card className="p-5 md:col-span-2">
            {step === 'intro' && (
              <div>
                <p className="text-grayish">Deeper questions linked to your Part 2 response.</p>
                <div className="mt-4"><Button onClick={start}>Start Part 3</Button></div>
              </div>
            )}

            {step === 'record' && (
              <div>
                <div className="mb-3">
                  <div className="text-small opacity-80">Questions</div>
                  <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10 whitespace-pre-line">
                    {prompt}
                  </div>
                </div>

                {supported ? (
                  <Recorder maxSeconds={120} onComplete={onComplete} />
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
                <div className="mt-4">
                  <Link href="/speaking/history">
                    <Button variant="secondary">View history</Button>
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
