// components/exam/AnswerControls/index.tsx
import * as React from 'react';
import type {
  AnyQuestion,
  MCQItem,
  TFNGItem,
  YNNGItem,
  HeadingItem,
  MatchingItem,
  ShortItem,
  EssayItem,
} from '@/types/questions';

export type AnswerValue =
  | string
  | string[]
  | Record<string, number | string>
  | undefined;

export type AnswerControlProps<T extends AnyQuestion = AnyQuestion> = {
  question: T;
  value?: AnswerValue;
  onChange?: (value: AnswerValue) => void;
  readOnly?: boolean;
  className?: string;
};

export function AnswerControl(props: AnswerControlProps) {
  const t = props.question.type;
  switch (t) {
    case 'mcq':
      return <MCQControl {...(props as AnswerControlProps<MCQItem>)} />;
    case 'tfng':
      return <TFNGControl {...(props as AnswerControlProps<TFNGItem>)} />;
    case 'ynng':
      return <YNNGControl {...(props as AnswerControlProps<YNNGItem>)} />;
    case 'heading':
      return <HeadingControl {...(props as AnswerControlProps<HeadingItem>)} />;
    case 'matching':
      return <MatchingControl {...(props as AnswerControlProps<MatchingItem>)} />;
    case 'short':
    case 'gap':
      return <ShortControl {...(props as AnswerControlProps<ShortItem>)} />;
    case 'essay':
      return <EssayControl {...(props as AnswerControlProps<EssayItem>)} />;
    default:
      return <div className="text-sm text-foreground/70">Unsupported question type.</div>;
  }
}

/* MCQ */
function MCQControl({ question, value, onChange, readOnly }: AnswerControlProps<MCQItem>) {
  const multi = question.multi;
  const current = (Array.isArray(value) ? value : value ? [String(value)] : []) as string[];

  function toggle(idx: number) {
    if (readOnly) return;
    const key = String(idx);
    if (multi) {
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      onChange?.(next);
    } else {
      onChange?.(key);
    }
  }

  return (
    <div className="space-y-2">
      {question.options.map((opt, idx) => {
        const id = `${question.id}_${idx}`;
        const checked = multi ? current.includes(String(idx)) : String(value ?? '') === String(idx);
        return (
          <label key={id} htmlFor={id} className="flex items-start gap-2 rounded-lg border border-border p-3 hover:bg-foreground/5">
            <input
              id={id}
              type={multi ? 'checkbox' : 'radio'}
              name={question.id}
              className="mt-1"
              checked={checked}
              disabled={readOnly}
              onChange={() => toggle(idx)}
            />
            <span className="text-sm">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

/* TF/NG */
function TFNGControl({ question, value, onChange, readOnly }: AnswerControlProps<TFNGItem>) {
  const opts: Array<{ v: 'T' | 'F' | 'NG'; label: string }> = [
    { v: 'T', label: 'True' },
    { v: 'F', label: 'False' },
    { v: 'NG', label: 'Not Given' },
  ];
  const v = String(value ?? '');
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(o.v)}
          className={[
            'rounded-lg border p-2 text-sm',
            v === o.v ? 'border-primary bg-primary/10' : 'border-border hover:bg-foreground/5',
          ].join(' ')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* Y/N/NG */
function YNNGControl({ value, onChange, readOnly }: AnswerControlProps<YNNGItem>) {
  const opts: Array<{ v: 'Y' | 'N' | 'NG'; label: string }> = [
    { v: 'Y', label: 'Yes' },
    { v: 'N', label: 'No' },
    { v: 'NG', label: 'Not Given' },
  ];
  const v = String(value ?? '');
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(o.v)}
          className={[
            'rounded-lg border p-2 text-sm',
            v === o.v ? 'border-primary bg-primary/10' : 'border-border hover:bg-foreground/5',
          ].join(' ')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* Heading (paragraph -> select heading) */
function HeadingControl({ question, value, onChange, readOnly }: AnswerControlProps<HeadingItem>) {
  const ans = (value as Record<string, number>) || {};
  return (
    <div className="space-y-3">
      {question.paragraphs.map((para) => (
        <div key={para} className="flex items-center gap-3">
          <div className="w-10 shrink-0 text-sm font-semibold text-foreground/80">§{para}</div>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            disabled={readOnly}
            value={ans[para] ?? ''}
            onChange={(e) => onChange?.({ ...ans, [para]: Number(e.target.value) })}
          >
            <option value="">— Select heading —</option>
            {question.headings.map((h, idx) => (
              <option key={idx} value={idx}>
                {String.fromCharCode(65 + idx)}. {h}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

/* Matching (left index -> right index) */
function MatchingControl({ question, value, onChange, readOnly }: AnswerControlProps<MatchingItem>) {
  const map = (value as Record<string, number>) || {};
  return (
    <div className="space-y-3">
      {question.left.map((l, li) => (
        <div key={li} className="flex items-center gap-3">
          <div className="shrink-0 w-6 text-sm font-semibold">{li + 1}.</div>
          <div className="flex-1 text-sm">{l}</div>
          <select
            className="w-40 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
            disabled={readOnly}
            value={map[li] ?? ''}
            onChange={(e) =>
              onChange?.({
                ...map,
                [li]: e.target.value ? Number(e.target.value) : ('' as any),
              })
            }
          >
            <option value="">—</option>
            {question.right.map((r, ri) => (
              <option key={ri} value={ri}>
                {String.fromCharCode(65 + ri)}. {r}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

/* Short / Gap */
function ShortControl({ value, onChange, readOnly }: AnswerControlProps<ShortItem>) {
  return (
    <input
      type="text"
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      placeholder="Type your answer"
      value={String(value ?? '')}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
    />
  );
}

/* Essay (Writing) */
function EssayControl({ question, value, onChange, readOnly }: AnswerControlProps<EssayItem>) {
  const text = String(value ?? '');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const min = question.minWords ?? 150;
  const max = question.maxWords ?? 350;

  return (
    <div className="space-y-2">
      <textarea
        className="min-h-[220px] w-full rounded-2xl border border-border bg-background p-3 text-sm"
        placeholder="Write your response here..."
        value={text}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
      />
      <div className="flex items-center justify-between text-xs text-foreground/70">
        <span>
          Words: <span className="tabular-nums">{words}</span>{' '}
          <span className={words < min ? 'text-warning' : words > max ? 'text-error' : 'text-foreground/70'}>
            (target {min}–{max})
          </span>
        </span>
        {question.rubricId && <span className="text-foreground/60">Rubric: {question.rubricId}</span>}
      </div>
    </div>
  );
}
