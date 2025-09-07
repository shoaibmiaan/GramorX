// components/design-system/StreakIndicator.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStreak } from "@/hooks/useStreak";
import { getDayKeyInTZ } from "@/lib/streak";

type Props = {
  className?: string;
  value?: number; // ✅ allow external streak value
};

export const StreakIndicator: React.FC<Props> = ({ className = "", value }) => {
  const { current, lastDayKey, completeToday, loading, shields } = useStreak();

  const [justCelebrated, setJustCelebrated] = useState(false);
  const todayKey = useMemo(() => getDayKeyInTZ(), []);
  const autoTriedRef = useRef(false);

  // Decide which streak value to use (prop > hook)
  const streakValue = value !== undefined ? value : current;

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
    if (!loading && streakValue >= 0) {
      setJustCelebrated(true);
      const t = setTimeout(() => setJustCelebrated(false), 1000);
      return () => clearTimeout(t);
    }
  }, [streakValue, loading]);

  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-ds px-3.5 py-2",
        "border border-electricBlue/30 bg-electricBlue/10 text-electricBlue",
        "dark:border-electricBlue/40 dark:bg-electricBlue/10",
        justCelebrated
          ? "shadow-[0_0_0_6px_rgba(0,187,249,0.25)] transition-shadow"
          : "",
        className,
      ].join(" ")}
      aria-label={`Current streak ${streakValue} days, ${shields} shields left`}
      title={`Streak: ${streakValue}`}
    >
      <i className="fas fa-fire" aria-hidden="true" />
      <span className="font-semibold tabular-nums">
        {Math.max(streakValue, 0)}
      </span>
      <i className="fas fa-shield-alt ml-3" aria-hidden="true" />
      <span className="font-semibold tabular-nums">{shields}</span>
    </div>
  );
};
