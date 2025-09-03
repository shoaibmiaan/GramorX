import * as React from 'react';

export type BandBreakdownProps = {
  overall: number;
  breakdown: { reading: number; listening: number; speaking: number; writing: number };
  confidence?: number; // 0..1
  className?: string;
};

function Bar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 9) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">Band {value.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        {/* width via style is allowed (not a color), keeps token colors intact */}
        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BandBreakdown({ overall, breakdown, confidence, className = '' }: BandBreakdownProps) {
  return (
    <section className={`rounded-xl border border-border p-4 ${className}`}>
      <p className="text-sm text-muted-foreground">Estimated overall</p>
      <p className="text-5xl font-semibold">Band {overall.toFixed(1)}</p>
      {typeof confidence === 'number' ? (
        <p className="mt-1 text-sm text-muted-foreground">Confidence: {(confidence * 100).toFixed(0)}%</p>
      ) : null}

      <div className="mt-6 grid gap-4">
        <Bar label="Reading" value={breakdown.reading} />
        <Bar label="Listening" value={breakdown.listening} />
        <Bar label="Speaking" value={breakdown.speaking} />
        <Bar label="Writing" value={breakdown.writing} />
      </div>
    </section>
  );
}
