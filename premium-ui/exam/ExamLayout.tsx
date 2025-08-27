import * as React from 'react';
import { PremiumThemeProvider } from '../theme/PremiumThemeProvider';
import { ThemeSwitcherPremium } from '../theme/ThemeSwitcher';

type Props = {
  children?: React.ReactNode;
  attemptId?: string;
  title?: string;
  totalParts?: number;
  currentPart?: number;
  seconds?: number;
  onTimeUp?: () => void;
  onTick?: (s: number) => void;
};

export function ExamLayout({
  children,
  attemptId,
  title = 'Exam Room',
  totalParts,
  currentPart,
  seconds,
  onTimeUp,
  onTick,
}: Props) {
  const [timeLeft, setTimeLeft] = React.useState<number | null>(seconds ?? null);

  // reset timer when seconds prop changes
  React.useEffect(() => {
    if (typeof seconds === 'number') {
      setTimeLeft(seconds);
    }
  }, [seconds]);

  // countdown effect
  React.useEffect(() => {
    if (timeLeft == null) return;
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }
    const id = setInterval(() => {
      setTimeLeft((t) => {
        const next = t != null ? t - 1 : t;
        if (next != null) {
          onTick?.(next);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeLeft, onTimeUp, onTick]);

  const mm = timeLeft != null ? String(Math.floor(timeLeft / 60)).padStart(2, '0') : '00';
  const ss = timeLeft != null ? String(timeLeft % 60).padStart(2, '0') : '00';

  return (
    <PremiumThemeProvider>
      <header className="pr sticky top-0 z-40 backdrop-blur bg-[color-mix(in oklab,var(--pr-bg),transparent 40%)] border-b border-[var(--pr-border)]">
        <div className="pr container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[var(--pr-card)] border border-[var(--pr-border)] grid place-items-center">🏛️</div>
            <div className="leading-tight">
              <div className="text-sm opacity-70">
                {attemptId ? `Attempt ${attemptId}` : 'Premium'}
              </div>
              <h1 className="font-semibold">{title}</h1>
              {totalParts != null && currentPart != null && (
                <div className="text-xs opacity-60">
                  Part {currentPart} of {totalParts}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {timeLeft != null && (
              <div className="px-3 py-1.5 rounded-xl border border-[var(--pr-border)] bg-[var(--pr-card)] font-mono text-sm">
                ⏱ {mm}:{ss}
              </div>
            )}
            <ThemeSwitcherPremium />
          </div>
        </div>
      </header>

      <main className="pr container mx-auto px-4 py-6">
        {children ?? <p className="opacity-80">Drop your module content here.</p>}
      </main>
    </PremiumThemeProvider>
  );
}

export default ExamLayout;

