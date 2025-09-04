'use client';

export function FireStreak({ value }: { value: number }) {
  return (
    <span
      className="
        inline-flex items-center gap-1.5 rounded-full
        bg-primary/12 px-2.5 py-1 text-sm font-semibold text-primary
        ring-1 ring-inset ring-border
      "
      title="Daily streak"
      aria-live="polite"
    >
      <span aria-hidden="true">🔥</span>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}
