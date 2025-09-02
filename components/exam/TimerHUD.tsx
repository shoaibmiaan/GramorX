// components/exam/TimerHUD.tsx
import * as React from 'react';

export type TimerHUDProps = {
  seconds: number;      // total countdown seconds
  onTimeUp?: () => void;
  warnAtSec?: number;   // color shift threshold
  className?: string;
};

export function TimerHUD({ seconds, onTimeUp, warnAtSec = 5 * 60, className }: TimerHUDProps) {
  const [remaining, setRemaining] = React.useState<number>(seconds);

  React.useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  React.useEffect(() => {
    if (remaining <= 0) {
      onTimeUp?.();
      return;
    }
    const id = setInterval(() => setRemaining((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [remaining, onTimeUp]);

  const mm = Math.floor(Math.max(0, remaining) / 60);
  const ss = Math.max(0, remaining) % 60;
  const label = `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;

  const tense = remaining <= warnAtSec;
  const critical = remaining <= 60;

  return (
    <div
      className={[
        'inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-card',
        className || '',
      ].join(' ')}
      title="Remaining time"
      aria-live="polite"
    >
      <div
        className={[
          'h-2 w-2 rounded-full',
          critical ? 'bg-error' : tense ? 'bg-warning' : 'bg-success',
        ].join(' ')}
      />
      <span className="tabular-nums font-semibold tracking-wide">{label}</span>
    </div>
  );
}
