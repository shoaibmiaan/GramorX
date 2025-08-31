import * as React from 'react';

export type TimerHUDProps = {
  seconds: number;
  onTimeUp?: () => void;
  /** warn when remaining time is <= this many seconds */
  warnAt?: number;
};

export function TimerHUD({ seconds, onTimeUp, warnAt = 60 }: TimerHUDProps) {
  const [left, setLeft] = React.useState(seconds);

  React.useEffect(() => {
    setLeft(seconds);
    if (seconds <= 0) {
      onTimeUp?.();
      return;
    }
    const id = setInterval(() => {
      setLeft(t => {
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

  const m = Math.floor(left / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(left % 60)
    .toString()
    .padStart(2, '0');
  const danger = left <= warnAt;

  return (
    <div
      className={`pr-font-mono pr-text-sm pr-rounded-xl pr-border pr-border-[var(--pr-border)] pr-px-3 pr-py-1.5 pr-bg-[var(--pr-card)] ${
        danger ? 'pr-text-[var(--pr-danger)] pr-animate-pulse' : ''
      }`}
    >
      ⏱ {m}:{s}
    </div>
  );
}
