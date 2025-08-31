import * as React from 'react';
import { PremiumThemeProvider } from '../theme/PremiumThemeProvider';
import { ThemeSwitcherPremium } from '../theme/ThemeSwitcher';
import { AntiCheatSentry } from '../monitoring/AntiCheatSentry';

type Props = {
  children?: React.ReactNode;
  attemptId?: string;
  title?: string;
  /** Total number of questions for the navigation palette */
  totalQuestions?: number;
  /** Currently active question */
  currentQuestion?: number;
  /** Navigate to a particular question */
  onNavigate?: (q: number) => void;
  /** Countdown timer in seconds */
  seconds?: number;
  /** Callback when timer hits zero */
  onTimeUp?: () => void;
  /** Optional answer sheet rendered beneath the question area */
  answerSheet?: React.ReactNode;
};

export function ExamShell({
  children,
  attemptId,
  title = 'Exam Room',
  totalQuestions = 20,
  currentQuestion = 1,
  onNavigate,
  seconds,
  onTimeUp,
  answerSheet,
}: Props) {
  const [timeLeft, setTimeLeft] = React.useState(seconds ?? 0);

  React.useEffect(() => {
    if (seconds === undefined) return;
    setTimeLeft(seconds);
    if (seconds <= 0) {
      onTimeUp?.();
      return;
    }
    const id = setInterval(() => {
      setTimeLeft(t => {
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

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <PremiumThemeProvider>
      <AntiCheatSentry attemptId={attemptId} />
      <header className="pr sticky top-0 z-40 backdrop-blur bg-[color-mix(in oklab,var(--pr-bg),transparent 40%)] border-b border-[var(--pr-border)]">
        <div className="pr container mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[var(--pr-card)] border border-[var(--pr-border)] grid place-items-center">🏛️</div>
            <div className="leading-tight">
              <div className="text-sm opacity-70">{attemptId ? `Attempt ${attemptId}` : 'Premium'}</div>
              <h1 className="font-semibold">{title}</h1>
            </div>
          </div>
          {seconds !== undefined && (
            <div className="justify-self-center px-3 py-1.5 rounded-xl border border-[var(--pr-border)] bg-[var(--pr-card)] font-mono text-sm">
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
          <div className="justify-self-end">
            <ThemeSwitcherPremium />
          </div>
        </div>
      </header>

      <main className="pr container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <section className="p-4 rounded-2xl border border-[var(--pr-border)] bg-[var(--pr-surface, var(--pr-card))] min-h-[60vh] grid grid-rows-[1fr_auto]">
            <div>{children ?? <p className="opacity-80">Drop your module content here.</p>}</div>
            {answerSheet && <div className="mt-4 border-t border-[var(--pr-border)] pt-4">{answerSheet}</div>}
          </section>

          <aside className="hidden md:block p-3 rounded-2xl border border-[var(--pr-border)] bg-[var(--pr-card)]">
            <div className="text-sm opacity-70 mb-2">Questions</div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const q = i + 1;
                const active = q === currentQuestion;
                return (
                  <button
                    key={q}
                    onClick={() => onNavigate?.(q)}
                    className={`aspect-square rounded-lg border border-[var(--pr-border)] text-sm hover:translate-y-[-1px] transition ${active ? 'bg-[var(--pr-primary)] text-white' : ''}`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </PremiumThemeProvider>
  );
}
