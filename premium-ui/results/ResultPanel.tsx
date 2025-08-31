import * as React from 'react';

export type Criteria = Record<string, number>;

type Props = {
  band: number;
  criteria: Criteria;
  feedback: string;
};

export function ResultPanel({ band, criteria, feedback }: Props) {
  return (
    <div className="pr-space-y-4 pr-rounded-2xl pr-border pr-border-[var(--pr-border)] pr-bg-[var(--pr-card)] pr-p-6">
      <div className="pr-text-center">
        <div className="pr-text-sm pr-opacity-70">Band Score</div>
        <div className="pr-text-4xl pr-font-bold">{band.toFixed(1)}</div>
      </div>

      <div>
        <h3 className="pr-font-semibold">Rubric Breakdown</h3>
        <ul className="pr-mt-2 pr-grid pr-grid-cols-2 pr-gap-2">
          {Object.entries(criteria).map(([k, v]) => (
            <li key={k} className="pr-flex pr-justify-between pr-text-sm">
              <span className="pr-capitalize">{k}</span>
              <span className="pr-font-medium">{v}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="pr-font-semibold">AI Feedback</h3>
        <p className="pr-mt-1 pr-text-sm pr-opacity-80 pr-whitespace-pre-line">{feedback}</p>
      </div>
    </div>
  );
}
