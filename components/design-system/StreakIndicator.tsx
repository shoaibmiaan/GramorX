// components/design-system/StreakIndicator.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStreak } from '@/hooks/useStreak';
import * as StreakLib from '@/lib/streak';

type Props = {
  className?: string;
};

// Safe helpers (work even if lib exports are misconfigured)
const safeGetLocalDayKey = (d?: Date) => {
  const fn = (StreakLib as any).getLocalDayKey;
  if (typeof fn === 'function') return fn(d);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d ?? new Date());
};

export const StreakIndicator: React.FC<Props> = ({ className = '' }) => {
  const { current, lastDayKey, completeToday, loading } = useStreak();

  const [justCelebrated, setJustCelebrated] = useState(false);
  const todayKey = useMemo(() => safeGetLocalDayKey(), []);
  const autoTriedRef = useRef(false);

  // Auto-claim once per mount if not yet claimed today
  useEffect(() => {
    if (autoTriedRef.current) return;
    if (loading) return;
    autoTriedRef.current = true;
    if (lastDayKey !== todayKey) {
      completeToday().catch(() => {});
    }
  }, [loading, lastDayKey, todayKey, completeToday]);

  // subtle glow on change
  useEffect(() => {
    if (!loading && current >= 0) {
      setJustCelebrated(true);
      const t = setTimeout(() => setJustCelebrated(false), 1000);
      return () => clearTimeout(t);
    }
  }, [current, loading]);

  return (
    <div
      className={[
        'inline-flex items-center gap-2 rounded-ds px-3.5 py-2',
        'border border-electricBlue/30 bg-electricBlue/10 text-electricBlue',
        'dark:border-electricBlue/40 dark:bg-electricBlue/10',
        justCelebrated ? 'shadow-[0_0_0_6px_rgba(0,187,249,0.25)] transition-shadow' : '',
        className,
      ].join(' ')}
      aria-label={`Current streak ${current} days`}
      title={`Streak: ${current}`}
    >
      <i className="fas fa-fire" aria-hidden="true" />
      <span className="font-semibold tabular-nums">{Math.max(current, 0)}</span>
    </div>
  );
};
