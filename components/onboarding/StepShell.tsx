// components/onboarding/StepShell.tsx
import * as React from 'react';

export type StepShellProps = {
  step: number;      // 1-based
  total: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  nextDisabled?: boolean;
  className?: string;
};

export function StepShell({
  step,
  total,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Continue',
  backLabel = 'Back',
  skipLabel = 'Skip',
  nextDisabled,
  className,
}: StepShellProps) {
  const pct = Math.max(0, Math.min(100, Math.round((step / Math.max(1, total)) * 100)));

  return (
    <div className={['mx-auto max-w-3xl px-4 py-6', className || ''].join(' ')}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-foreground/70">{subtitle}</p>}
          </div>
          <div className="text-xs text-foreground/60 tabular-nums">
            {step}/{total}
          </div>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Body */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        {children}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 mt-4 border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl py-3 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-foreground/5 disabled:opacity-50"
              disabled={step <= 1 || !onBack}
            >
              {backLabel}
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-foreground/5"
              >
                {skipLabel}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!!nextDisabled}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StepShell;
