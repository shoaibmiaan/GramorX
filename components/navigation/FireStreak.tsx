'use client';

export function FireStreak({ value }: { value: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-2.5 py-1 text-sm font-semibold"
      title="Daily streak"
    >
      <span aria-hidden="true">🔥</span>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}
