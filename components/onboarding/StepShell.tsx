// components/onboarding/StepShell.tsx
import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { motion, AnimatePresence } from 'framer-motion';

export type StepMeta = { label: string; href?: string; done?: boolean };

export type StepShellProps = {
  step: number;        // 1-based
  total: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;

  // Navigation
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;

  // Labels
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;

  // UI states
  nextDisabled?: boolean;
  className?: string;

  // Optional fancy bits
  steps?: StepMeta[];  // step pills at top (labels + optional links)
  hint?: string;       // small tip ribbon below header
};

const StepShell: React.FC<StepShellProps> = ({
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
  steps,
  hint,
}) => {
  const pct = Math.max(0, Math.min(100, Math.round((step / Math.max(1, total)) * 100)));
  const isLast = step >= total;

  // Keyboard shortcuts: ← / → / Enter / Esc
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'ArrowRight') onNext?.();
      if (e.key === 'ArrowLeft') onBack?.();
      if (e.key === 'Escape') onSkip?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onBack, onSkip]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Container className={['max-w-3xl py-8', className || ''].join(' ')}>

        {/* Header — glass with gradient underline + animated progress */}
        <div className="header-glass rounded-ds-2xl border border-border p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-foreground/70">{subtitle}</p>}
            </div>
            <div className="shrink-0 rounded-full px-3 py-1 text-xs bg-primary/10 text-primary tabular-nums">
              {step}/{total}
            </div>
          </div>

          {/* Optional step pills (clickable via Link when href provided) */}
          {Array.isArray(steps) && steps.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" data-steps>
              {steps.map((s, i) => {
                const idx = i + 1;
                const active = idx === step;
                const done = (s.done ?? idx < step);
                const pillClasses = [
                  'nav-pill select-none',
                  'rounded-ds-xl border px-3 py-1 text-xs',
                  active ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border',
                  done && !active ? 'ring-1 ring-success/40' : '',
                ].join(' ');

                return s.href ? (
                  <Link key={s.label + i} href={s.href} className={pillClasses}>
                    <span className="opacity-80">Step {idx} · </span>
                    <span className="font-medium">{s.label}</span>
                  </Link>
                ) : (
                  <div key={s.label + i} className={pillClasses}>
                    <span className="opacity-80">Step {idx} · </span>
                    <span className="font-medium">{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Hint ribbon */}
          {hint && (
            <div className="mt-3 rounded-ds-xl border border-border bg-card/60 p-2 text-xs text-mutedText">
              {hint}
            </div>
          )}

          {/* Animated gradient progress */}
          <div
            className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-label="Onboarding progress"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="h-full bg-gradient-to-r from-primary via-electricBlue to-vibrantPurple"
            />
            <div className="pointer-events-none absolute inset-0 animate-[shimmer_2.2s_linear_infinite] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.25),transparent)] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" />
          </div>
        </div>

        {/* Body card with subtle enter animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-body-${step}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <Card className="card-surface p-5 rounded-ds-2xl border border-border">
              {children}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Footer — sticky, glow, keyboard tips */}
        <div className="sticky bottom-0 mt-4 rounded-ds-2xl border border-border bg-gradient-to-r from-primary/10 via-electricBlue/10 to-vibrantPurple/10 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-3 py-3">
            <div className="flex items-center gap-2 text-xs text-mutedText">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5">←</kbd>
              <span>Back</span>
              <span className="opacity-50">·</span>
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5">→</kbd>
              <span>Next</span>
              <span className="opacity-50">·</span>
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5">Enter</kbd>
              <span>Continue</span>
              {onSkip && (
                <>
                  <span className="opacity-50">·</span>
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5">Esc</kbd>
                  <span>Skip</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                disabled={step <= 1 || !onBack}
                className="rounded-ds-xl"
              >
                {backLabel}
              </Button>

              {onSkip && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onSkip}
                  className="rounded-ds-xl"
                >
                  {skipLabel}
                </Button>
              )}

              <motion.div
                animate={isLast ? { scale: [1, 1.04, 1] } : {}}
                transition={isLast ? { repeat: Infinity, duration: 2 } : {}}
              >
                <Button
                  type="button"
                  onClick={onNext}
                  disabled={!!nextDisabled}
                  className="rounded-ds-xl shadow-glow hover:shadow-glowLg"
                >
                  {isLast ? 'Finish' : nextLabel}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>

      {/* subtle completion pulse */}
      <AnimatePresence>
        {isLast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none fixed inset-0 bg-radial from-vibrantPurple/10 via-primary/5 to-transparent"
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .bg-radial {
          background-image: radial-gradient(600px 300px at 50% 40%, rgba(157, 78, 221, 0.15), transparent 70%);
        }
      `}</style>
    </div>
  );
};

export default StepShell;
