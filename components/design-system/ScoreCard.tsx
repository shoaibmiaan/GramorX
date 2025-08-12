import React from 'react';

export type Subscores = {
  taskResponse?: number;
  coherence?: number;
  vocabulary?: number;
  grammar?: number;
  pronunciation?: number;
  fluency?: number;
};

export type ScoreCardProps = {
  overall: number; // e.g., 6.5
  subscores?: Subscores;
  title?: string;
  className?: string;
};

function clampBand(b: number) {
  return Math.max(0, Math.min(9, b));
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ overall, subscores, title='Band Score', className='' }) => {
  const band = clampBand(overall);
  const pct = (band / 9) * 100;

  return (
    <div className={`card-surface rounded-ds-2xl p-6 ${className}`}>
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24" aria-hidden="true">
          <svg viewBox="0 0 36 36" className="h-full w-full">
            <path
              className="text-gray-200 dark:text-white/10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
            />
            <path
              className="text-primary dark:text-electricBlue"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${pct}, 100`}
              d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-h3 font-semibold tabular-nums">{band.toFixed(1)}</div>
          </div>
        </div>
        <div>
          <div className="text-small text-gray-600 dark:text-grayish">{title}</div>
          <div className="text-h2 font-slab">Overall {band.toFixed(1)}</div>
          {subscores && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-small">
              {Object.entries(subscores).map(([k, v]) => (
                v != null && (
                  <div key={k} className="flex items-center justify-between rounded-ds px-2.5 py-1.5 bg-purpleVibe/10 text-lightText dark:text-white">
                    <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold tabular-nums">{clampBand(v).toFixed(1)}</span>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
