// components/exam/AnswerControls/Input.tsx
import * as React from 'react';

export type AnswerInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> & {
  id?: string;
  /** Question id (Q1, Q2…) used for aria attrs and form name */
  qid: string;
  /** Controlled value (answer text) */
  value: string;
  /** Called with the new value */
  onChange: (val: string) => void;
  /** Optional visible label (defaults to qid) */
  label?: string;
  /** Optional supporting text below the input */
  helpText?: string;
  /** Optional error message */
  error?: string;
  /** Render compact (denser) variant */
  compact?: boolean;
};

export const AnswerInput = React.forwardRef<HTMLInputElement, AnswerInputProps>(
  (
    {
      id,
      qid,
      value,
      onChange,
      label,
      helpText,
      error,
      compact = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const inputId = id ?? `answer-${qid}`;
    const helpId = helpText ? `${inputId}-help` : undefined;
    const errId = error ? `${inputId}-error` : undefined;

    return (
      <div className={`w-full ${className}`}>
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-foreground/90"
        >
          {label ?? qid}
        </label>

        <input
          ref={ref}
          id={inputId}
          name={qid}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          aria-describedby={[helpId, errId].filter(Boolean).join(' ') || undefined}
          aria-invalid={!!error || undefined}
          className={[
            'w-full rounded-md border border-border bg-background',
            compact ? 'px-2 py-1.5 text-sm' : 'px-3 py-2 text-base',
            'outline-none focus:ring-2 focus:ring-primary/40',
            error ? 'ring-1 ring-red-500/40' : '',
          ].join(' ')}
          {...rest}
        />

        {helpText ? (
          <p id={helpId} className="mt-1 text-xs text-foreground/60">
            {helpText}
          </p>
        ) : null}

        {error ? (
          <p id={errId} className="mt-1 text-xs text-red-400">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
AnswerInput.displayName = 'AnswerInput';

export default AnswerInput;
