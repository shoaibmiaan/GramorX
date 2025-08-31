import * as React from 'react';
import { PremiumThemeProvider } from '../theme/PremiumThemeProvider';
import { ThemeSwitcherPremium } from '../theme/ThemeSwitcher';
import { QuestionCanvas, type MCQItem } from './QuestionCanvas';
import { TimerHUD } from './TimerHUD';
import { AntiCheatSentry } from '../monitoring/AntiCheatSentry';

type Props = {
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
  /** Question item to render */
  question: MCQItem;
  /** Handle answer selection */
  onAnswer?: (val: string) => void;
  /** Optional answer sheet rendered beneath the question area */
  answerSheet?: React.ReactNode;
  /** Optional scratchpad rendered in the side panel */
  scratchpad?: React.ReactNode;
  /** Optional media dock rendered in the side panel */
  mediaDock?: React.ReactNode;
};

export function ExamShell({
  attemptId,
  title = 'Exam Room',
  totalQuestions = 20,
  currentQuestion = 1,
  onNavigate,
  seconds,
  onTimeUp,
  question,
  onAnswer,
  answerSheet,
  scratchpad,
  mediaDock,
}: Props) {
  return (
    <PremiumThemeProvider>
      <AntiCheatSentry attemptId={attemptId} />

      <header className="pr-sticky pr-top-0 pr-z-40 pr-backdrop-blur pr-bg-[color-mix(in_oklab,var(--pr-bg),transparent_40%)] pr-border-b pr-border-[var(--pr-border)]">
        <div className="pr-container pr-mx-auto pr-grid pr-grid-cols-[1fr_auto_1fr] pr-items-center pr-gap-4 pr-px-4 pr-py-3">
          <div className="pr-flex pr-items-center pr-gap-3">
            <div className="pr-h-8 pr-w-8 pr-rounded-xl pr-bg-[var(--pr-card)] pr-border pr-border-[var(--pr-border)] pr-grid pr-place-items-center">🏛️</div>
            <div className="pr-leading-tight">
              <div className="pr-text-sm pr-opacity-70">{attemptId ? `Attempt ${attemptId}` : 'Premium'}</div>
              <h1 className="pr-font-semibold">{title}</h1>
            </div>
          </div>

          {seconds !== undefined && (
            <div className="pr-justify-self-center">
              <TimerHUD seconds={seconds} onTimeUp={onTimeUp} />
            </div>
          )}

          <div className="pr-justify-self-end">
            <ThemeSwitcherPremium />
          </div>
        </div>
      </header>

      <main className="pr-container pr-mx-auto pr-px-4 pr-py-6">
        <div className="pr-grid pr-gap-4 md:pr-grid-cols-[1fr_260px]">
          <section className="pr-p-4 pr-rounded-2xl pr-border pr-border-[var(--pr-border)] pr-bg-[var(--pr-surface,var(--pr-card))] pr-min-h-[60vh] pr-grid pr-grid-rows-[1fr_auto]">
            <QuestionCanvas
              item={question}
              onAnswer={onAnswer}
              onPrev={currentQuestion > 1 ? () => onNavigate?.(currentQuestion - 1) : undefined}
              onNext={currentQuestion < totalQuestions ? () => onNavigate?.(currentQuestion + 1) : undefined}
            />
            {answerSheet && (
              <div className="pr-mt-4 pr-border-t pr-border-[var(--pr-border)] pr-pt-4">
                {answerSheet}
              </div>
            )}
          </section>

          <aside className="pr-hidden md:pr-block pr-p-3 pr-rounded-2xl pr-border pr-border-[var(--pr-border)] pr-bg-[var(--pr-card)]">
            <div className="pr-text-sm pr-opacity-70 pr-mb-2">Questions</div>
            <div className="pr-grid pr-grid-cols-5 pr-gap-2">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const q = i + 1;
                const active = q === currentQuestion;
                return (
                  <button
                    key={q}
                    onClick={() => onNavigate?.(q)}
                    className={`pr-aspect-square pr-rounded-lg pr-border pr-border-[var(--pr-border)] pr-text-sm hover:pr-translate-y-[-1px] pr-transition ${active ? 'pr-bg-[var(--pr-primary)] pr-text-white' : ''}`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>

            {scratchpad}
            {mediaDock}
          </aside>
        </div>
      </main>
    </PremiumThemeProvider>
  );
}
