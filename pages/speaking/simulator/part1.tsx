// pages/speaking/simulator/part1.tsx
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { uploadSpeakingBlob } from '@/lib/speaking/uploadSpeakingBlob';
import { useRouter } from 'next/router';
import { useTTS } from '@/components/speaking/useTTS';

const Recorder = dynamic(() => import('@/components/speaking/Recorder').then(m => m.Recorder), { ssr: false });

type Accent = 'UK' | 'US' | 'AUS';
type Step = 'idle' | 'countdown' | 'asking' | 'recording' | 'review' | 'uploading' | 'done' | 'err';

const QUESTION = 'What type of films do you like best? Why?';
const MAX_MS = 60_000;

export default function SpeakingPart1() {
  const router = useRouter();
  const { speak } = useTTS();

  const [accent, setAccent] = useState<Accent>('UK');
  const [step, setStep] = useState<Step>('idle');
  const [err, setErr] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [blobURL, setBlobURL] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | undefined>();
  const timerRef = useRef<number | null>(null);

  // Auth hint (avoid 401)
  const [loggedIn, setLoggedIn] = useState(true);
  useMemo(async () => {
    const { data: { session } } = await supabaseBrowser.auth.getSession();
    setLoggedIn(!!session);
  }, []);

  const resetTimers = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startFlow = useCallback(async () => {
    setErr(null);
    setBlobURL(null);
    setStep('countdown');
    setCountdown(3);
  }, []);

  // 3-2-1 get-ready
  useEffect(() => {
    if (step !== 'countdown') return;
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          // Speak the question, then start recording
          (async () => {
            setStep('asking');
            await speak(QUESTION, accent, 1);
            setStep('recording');
            setTimeLeft(60);
            setActive(true);
            resetTimers();
            timerRef.current = window.setInterval(() => {
              setTimeLeft((t) => {
                if (t <= 1) {
                  setActive(false); // Recorder will stop and call onComplete
                  resetTimers();
                  return 0;
                }
                return t - 1;
              });
            }, 1000);
          })();
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, accent]);

  const handleComplete = useCallback((blob: Blob) => {
    setActive(false);
    resetTimers();
    const url = URL.createObjectURL(blob);
    setBlobURL(url);
    setStep('review');
  }, []);

  const uploadNow = useCallback(async () => {
    if (!blobURL) return;
    try {
      setStep('uploading');
      const blob = await (await fetch(blobURL)).blob();
      const out = await uploadSpeakingBlob(blob, 'p1', attemptId);
      if (out?.attemptId) setAttemptId(out.attemptId);
      setStep('done');
    } catch (e: any) {
      setErr(e.message ?? 'Upload failed');
      setStep('err');
    }
  }, [blobURL, attemptId]);

  const disabled = step === 'countdown' || step === 'asking' || step === 'recording' || step === 'uploading';

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-slab text-4xl text-gradient-primary">Simulator — Part 1</h1>
          <Button variant="secondary" onClick={() => router.back()} className="rounded-ds-xl">Back</Button>
        </div>

        {!loggedIn && (
          <Alert variant="warning" title="You’re not signed in" className="mb-6">
            Sign in so we can save your attempt and avoid Unauthorized errors on upload.
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: settings */}
          <Card className="p-6 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-4">
              <Button variant="secondary" className="rounded-ds">Settings</Button>
              <Badge variant="info" size="sm">Optional</Badge>
            </div>

            <div className="mb-6">
              <div className="text-small text-gray-600 dark:text-grayish mb-2">Accent:</div>
              <div className="flex gap-2">
                {(['UK','US','AUS'] as const).map(a => (
                  <Button
                    key={a}
                    variant={a === accent ? 'primary' : 'secondary'}
                    className="rounded-ds"
                    onClick={() => setAccent(a)}
                    disabled={disabled}
                  >
                    {a}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              className="rounded-ds-xl"
              onClick={startFlow}
              disabled={disabled}
            >
              {step === 'recording' ? 'Recording…' : 'Speak again'}
            </Button>

            <div className="mt-4">
              <Recorder
                active={active}
                maxMs={MAX_MS}
                onComplete={handleComplete}
                onError={(e) => { setErr(e.message ?? String(e)); setStep('err'); setActive(false); resetTimers(); }}
                showUI
              />
            </div>
          </Card>

          {/* Right: question, status, controls */}
          <Card className="p-6 rounded-ds-2xl">
            <div className="text-small text-gray-600 dark:text-grayish mb-2">Question</div>
            <div className="border rounded-ds p-4 mb-5 bg-white dark:bg-dark/50 dark:border-purpleVibe/30">
              {QUESTION}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-small text-gray-600 dark:text-grayish">
                {step === 'idle' && 'Ready to start.'}
                {step === 'countdown' && `Get ready… ${countdown}`}
                {step === 'asking' && 'Listening to the question…'}
                {step === 'recording' && 'Recording your answer…'}
                {step === 'review' && 'Review your answer below.'}
                {step === 'uploading' && 'Uploading…'}
                {step === 'done' && 'Saved. You can continue to Part 2.'}
                {step === 'err' && <span className="text-sunsetOrange">Something went wrong.</span>}
              </div>
              <div className="text-small text-gray-600 dark:text-grayish">{step === 'recording' ? `${timeLeft}s left` : '60s max'}</div>
            </div>

            {/* Review player */}
            {blobURL && (step === 'review' || step === 'done') && (
              <div className="mb-4">
                <audio controls src={blobURL} className="w-full" />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="rounded-ds"
                onClick={() => { setActive(false); }}
                disabled={step !== 'recording'}
              >
                Stop
              </Button>

              {step === 'review' && (
                <Button variant="primary" className="rounded-ds" onClick={uploadNow}>
                  Save & Upload
                </Button>
              )}

              <Button
                as="a"
                href="/speaking/simulator/part2"
                variant="accent"
                className="rounded-ds"
                disabled={step !== 'done'}
              >
                Continue to Part 2
              </Button>
            </div>

            {err && (
              <Alert className="mt-5" variant="error" title="Recorder/Upload error">
                {err}
              </Alert>
            )}
          </Card>
        </div>
      </Container>
    </section>
  );
}
