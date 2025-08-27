import * as React from 'react';
import { PremiumThemeProvider } from '../theme/PremiumThemeProvider';
import { ThemeSwitcherPremium } from '../theme/ThemeSwitcher';

type Props = {
  children?: React.ReactNode;
  attemptId?: string;
  title?: string;
  /** total number of exam parts */
  totalParts?: number;
  /** currently active part (1-indexed) */
  currentPart?: number;
  /** initial countdown time in seconds */
  seconds?: number;
  /** callback when timer reaches 0 */
  onTimeUp?: () => void;
};

export function ExamShell({
  children,
  attemptId,
  title = 'Exam Room',
  totalParts = 0,
  currentPart = 1,
  seconds,
  onTimeUp,
}: Props) {
  const [timeLeft, setTimeLeft] = React.useState(seconds ?? 0);

  React.useEffect(() => {
    if (typeof seconds === 'number') setTimeLeft(seconds);
  }, [seconds]);

  React.useEffect(() => {
    if (typeof seconds !== 'number') return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          onTimeUp?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, onTimeUp]);

  const mins = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <PremiumThemeProvider>
      <header className="pr sticky top-0 z-40 backdrop-blur bg-[color-mix(in oklab,var(--pr-bg),transparent 40%)] border-b border-[var(--pr-border)]">
        <div className="pr container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[var(--pr-card)] border border-[var(--pr-border)] grid place-items-center">🏛️</div>
            <div className="leading-tight">
              <div className="text-sm opacity-70">{attemptId ? `Attempt ${attemptId}` : 'Premium'}</div>
              <h1 className="font-semibold">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl border border-[var(--pr-border)] bg-[var(--pr-card)] font-mono text-sm">
              ⏱ {mins}:{secs}
            </div>
            <ThemeSwitcherPremium />
          </div>
        </div>
      </header>

      <main className="pr container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <aside className="hidden md:block p-3 rounded-2xl border border-[var(--pr-border)] bg-[var(--pr-card)]">
            <div className="text-sm opacity-70 mb-2">Questions</div>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: totalParts }).map((_, i) => {
                const part = i + 1;
                const active = part === currentPart;
                return (
                  <button
                    key={part}
                    className={`aspect-square rounded-lg border border-[var(--pr-border)] text-sm hover:translate-y-[-1px] transition ${
                      active ? 'bg-[var(--pr-primary)] text-[var(--pr-on-primary)]' : ''
                    }`}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="p-4 rounded-2xl border border-[var(--pr-border)] bg-[var(--pr-surface, var(--pr-card))] min-h-[60vh]">
            {children ?? <p className="opacity-80">Drop your module content here.</p>}
          </section>
        </div>
      </main>
    </PremiumThemeProvider>
  );
}

export default ExamShell;
