// components/exam/ExamShell.tsx
import * as React from 'react';
import { TimerHUD } from './TimerHUD';
import { QuestionPalette, type QuestionPaletteStatus } from './QuestionPalette';

export type ExamShellProps = {
  title?: string;
  seconds?: number;
  onTimeUp?: () => void;

  totalQuestions?: number;
  currentQuestion?: number; // 1-based
  onNavigate?: (q: number) => void;
  statuses?: QuestionPaletteStatus[]; // length = totalQuestions
  onToggleFlag?: (q: number) => void;

  left?: React.ReactNode;         // optional left rail (e.g., passage nav)
  right?: React.ReactNode;        // custom right panel; if omitted, palette shows
  footer?: React.ReactNode;       // submit/prev/next actions
  children: React.ReactNode;      // question area
  className?: string;
};

export function ExamShell({
  title,
  seconds,
  onTimeUp,
  totalQuestions = 0,
  currentQuestion = 1,
  onNavigate,
  statuses,
  onToggleFlag,
  left,
  right,
  footer,
  children,
  className,
}: ExamShellProps) {
  return (
    <div className={['min-h-[70vh] w-full', className || ''].join(' ')}>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground truncate">{title ?? 'Exam'}</h1>
          {typeof seconds === 'number' && (
            <TimerHUD seconds={seconds} onTimeUp={onTimeUp} />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-4 grid grid-cols-12 gap-4">
        {/* Left rail (optional) */}
        {left ? (
          <aside className="col-span-12 lg:col-span-3">{left}</aside>
        ) : null}

        {/* Question area */}
        <main
          className={
            left && (right || totalQuestions > 0)
              ? 'col-span-12 lg:col-span-6'
              : right || totalQuestions > 0
              ? 'col-span-12 lg:col-span-8'
              : left
              ? 'col-span-12 lg:col-span-9'
              : 'col-span-12'
          }
        >
          <div className="rounded-2xl border border-border bg-card text-foreground shadow-card">
            <div className="p-4">{children}</div>
          </div>
        </main>

        {/* Right rail (palette default) */}
        <aside className="col-span-12 lg:col-span-3">
          {right ?? (
            <QuestionPalette
              total={totalQuestions}
              current={currentQuestion}
              statuses={statuses}
              onNavigate={onNavigate}
              onToggleFlag={onToggleFlag}
              className="rounded-2xl border border-border bg-card shadow-card"
            />
          )}
        </aside>
      </div>

      {/* Footer */}
      {footer ? (
        <div className="sticky bottom-0 z-10 border-t border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}
