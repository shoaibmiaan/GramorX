// components/exam/QuestionPalette.tsx
import * as React from 'react';

export type QuestionPaletteStatus = 'unseen' | 'seen' | 'answered' | 'flagged';

export type QuestionPaletteProps = {
  total: number;
  current?: number; // 1-based
  statuses?: QuestionPaletteStatus[]; // optional, len = total
  onNavigate?: (q: number) => void;
  onToggleFlag?: (q: number) => void;
  className?: string;
};

export function QuestionPalette({
  total,
  current = 1,
  statuses = [],
  onNavigate,
  onToggleFlag,
  className,
}: QuestionPaletteProps) {
  const items = Array.from({ length: total }, (_, i) => i + 1);

  function dotClass(s: QuestionPaletteStatus | undefined) {
    switch (s) {
      case 'answered':
        return 'bg-success';
      case 'flagged':
        return 'bg-warning';
      case 'seen':
        return 'bg-foreground/60';
      default:
        return 'bg-border';
    }
  }

  return (
    <div className={['p-3', className || ''].join(' ')}>
      <div className="px-1 py-1">
        <div className="text-sm font-semibold text-foreground mb-2">Questions</div>
        <div className="grid grid-cols-8 gap-1.5">
          {items.map((q) => {
            const active = q === current;
            const status = statuses[q - 1];

            return (
              <button
                key={q}
                type="button"
                onClick={() => onNavigate?.(q)}
                className={[
                  'relative h-9 rounded-md border text-sm font-medium',
                  active ? 'border-primary bg-primary/10 text-foreground' : 'border-border hover:bg-foreground/5',
                ].join(' ')}
                title={`Go to question ${q}`}
              >
                {q}
                <span
                  className={[
                    'absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full',
                    dotClass(status),
                  ].join(' ')}
                />
                {status === 'flagged' && (
                  <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-sm bg-warning" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground/80">
          <LegendDot className="bg-success" label="Answered" />
          <LegendDot className="bg-warning" label="Flagged" />
          <LegendDot className="bg-foreground/60" label="Seen" />
          <LegendDot className="bg-border" label="Unseen" />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={['h-2.5 w-2.5 rounded-full', className].join(' ')} />
      {label}
    </span>
  );
}
