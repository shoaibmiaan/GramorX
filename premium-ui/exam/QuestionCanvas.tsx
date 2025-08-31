import * as React from 'react';
import { PrButton } from '../components/PrButton';

export type MCQItem = {
  number: number;
  prompt: string;
  options: { key: string; label: string }[];
  value?: string;
};

export type QuestionCanvasProps = {
  item: MCQItem;
  onAnswer?: (val: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export function QuestionCanvas({ item, onAnswer, onPrev, onNext }: QuestionCanvasProps) {
  return (
    <div className="pr-grid pr-gap-6">
      <div>
        <p className="pr-mb-4">{item.prompt}</p>
        <div className="pr-grid pr-gap-2">
          {item.options.map(opt => (
            <label
              key={opt.key}
              className="pr-flex pr-items-center pr-gap-3 pr-p-2 pr-rounded-lg pr-border pr-border-[var(--pr-border)] hover:pr-bg-[var(--pr-card)]"
            >
              <input
                type="radio"
                name={`q-${item.number}`}
                className="pr-h-4 pr-w-4"
                checked={item.value === opt.key}
                onChange={() => onAnswer?.(opt.key)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pr-flex pr-justify-between pr-pt-4 pr-border-t pr-border-[var(--pr-border)]">
        <PrButton variant="outline" onClick={onPrev} disabled={!onPrev}>
          Prev
        </PrButton>
        <PrButton onClick={onNext} disabled={!onNext}>
          Next
        </PrButton>
      </div>
    </div>
  );
}
