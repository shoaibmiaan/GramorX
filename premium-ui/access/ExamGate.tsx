import * as React from 'react';
import { PrButton } from '../components/PrButton';
import { PremiumThemeProvider } from '../theme/PremiumThemeProvider';

/**
 * ExamGate performs last minute checks before the exam starts.
 * It verifies user's premium entitlement, asks for microphone & camera
 * permissions and ensures fullscreen support is available.
 */
export function ExamGate({ onReady }: { onReady: () => void }) {
  const [checking, setChecking] = React.useState(true);
  const [eligible, setEligible] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/premium/eligibility');
        const data = await res.json();
        if (!res.ok || !data?.eligible) {
          setError(data?.error || 'You are not eligible to take this exam.');
        } else {
          setEligible(true);
        }
      } catch {
        setError('Unable to verify eligibility. Please try again.');
      } finally {
        setChecking(false);
      }
    }
    check();
  }, []);

  const startExam = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      // Immediately stop tracks – we only needed the permission
      stream.getTracks().forEach(t => t.stop());
    } catch {
      setError('Microphone and camera permissions are required.');
      return;
    }

    if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) {
      setError('Fullscreen mode is not supported in this browser.');
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* ignore */
    }

    onReady();
  };

  return (
    <PremiumThemeProvider>
      <div className="pr-min-h-[100dvh] pr-flex pr-items-center pr-justify-center pr-p-4">
        <div className="pr-w-full pr-max-w-sm pr-space-y-4 pr-text-center pr-bg-[var(--pr-card)] pr-border pr-border-[var(--pr-border)] pr-rounded-2xl pr-p-6">
          {checking ? (
            <p>Checking eligibility…</p>
          ) : !eligible ? (
            <p className="pr-text-red-500">{error || 'Not eligible to take the exam.'}</p>
          ) : (
            <React.Fragment>
              <p className="pr-text-sm pr-opacity-80">
                We need microphone, camera and fullscreen permission before you begin.
              </p>
              {error && <p className="pr-text-red-500 pr-text-sm">{error}</p>}
              <PrButton onClick={startExam} className="pr-w-full">
                Start Exam
              </PrButton>
            </React.Fragment>
          )}
        </div>
      </div>
    </PremiumThemeProvider>
  );
}

export default ExamGate;
