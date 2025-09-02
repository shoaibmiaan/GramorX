// components/review/AIFeedbackPanel.tsx
import * as React from 'react';

export type AIFeedbackPanelProps = {
  module: 'writing' | 'speaking' | 'reading' | 'listening';
  overall?: number; // band 0..9 (if applicable)
  criteria?: Record<string, number>; // e.g., task/coherence/lexical/grammar
  notes?: string; // markdown/plain summary
  tips?: string[]; // quick, actionable tips
  tokensUsed?: number;
  header?: string;
  onRegrade?: () => void;
  onDownload?: () => void;
  className?: string;
};

export function AIFeedbackPanel({
  module,
  overall,
  criteria,
  notes,
  tips,
  tokensUsed,
  header = 'AI Feedback',
  onRegrade,
  onDownload,
  className,
}: AIFeedbackPanelProps) {
  const critList = Object.entries(criteria ?? {});
  const band = typeof overall === 'number' ? Math.max(0, Math.min(9, overall)) : undefined;

  return (
    <section className={['rounded-2xl border border-border bg-card p-4 shadow-card', className || ''].join(' ')}>
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">{header}</h3>
        <div className="flex gap-2">
          {onRegrade && (
            <button
              type="button"
              onClick={onRegrade}
              className="rounded-xl border border-border px-3 py-1.5 text-sm hover:bg-foreground/5"
              title="Re-run AI grading"
            >
              Regrade
            </button>
          )}
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              title="Download feedback"
            >
              Download
            </button>
          )}
        </div>
      </header>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall band */}
        <div className="rounded-xl border border-border p-3">
          <div className="text-xs text-foreground/70">Module</div>
          <div className="text-sm font-medium capitalize">{module}</div>
          <div className="mt-3 text-xs text-foreground/70">Overall</div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-3xl font-bold tabular-nums">{band ?? '—'}</span>
            {typeof band === 'number' && <span className="text-xs text-foreground/70">/ 9</span>}
          </div>
          {typeof tokensUsed === 'number' && (
            <div className="mt-3 text-xs text-foreground/60">Tokens: {tokensUsed}</div>
          )}
        </div>

        {/* Criteria */}
        <div className="sm:col-span-2 rounded-xl border border-border p-3">
          <div className="text-xs text-foreground/70 mb-2">Criteria</div>
          {critList.length ? (
            <ul className="space-y-2">
              {critList.map(([k, v]) => (
                <li key={k}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{labelize(k)}</span>
                    <span className="tabular-nums font-medium">{v}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, (v / 9) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-foreground/70">No criteria available.</div>
          )}
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mt-4 rounded-xl border border-border p-3">
          <div className="text-xs text-foreground/70 mb-2">Summary</div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{notes}</p>
        </div>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div className="mt-4 rounded-xl border border-border p-3">
          <div className="text-xs text-foreground/70 mb-2">Actionable Tips</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function labelize(key: string) {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default AIFeedbackPanel;
 