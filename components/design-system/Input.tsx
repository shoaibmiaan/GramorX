import React, { useId } from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  iconLeft,
  iconRight,
  className = '',
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const describedBy =
    error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  const base = [
    'w-full rounded-ds border border-border bg-card text-lightText placeholder-mutedText',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
    'disabled:opacity-60',
    'dark:bg-dark/50 dark:text-foreground dark:placeholder-mutedText/40',
    'dark:border-purpleVibe/30 dark:focus:ring-electricBlue dark:focus:border-electricBlue',
  ].join(' ');
  const invalid = error
    ? 'border-sunsetOrange focus:ring-sunsetOrange focus:border-sunsetOrange'
    : '';

  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 inline-block text-small text-mutedText">
          {label}
        </span>
      )}
      <div className={`relative flex items-center ${error ? 'text-sunsetOrange' : ''}`}>
        {iconLeft && (
          <span className="absolute left-3 text-mutedText opacity-60 dark:text-mutedText">
            {iconLeft}
          </span>
        )}
        <input
          id={inputId}
          className={`${base} ${invalid} ${iconLeft ? 'pl-10' : 'pl-4'} ${
            iconRight ? 'pr-10' : 'pr-4'
          } py-3`}
          aria-describedby={describedBy}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 text-mutedText opacity-60 dark:text-mutedText">
            {iconRight}
          </span>
        )}
      </div>
      {error ? (
        <span id={`${inputId}-error`} className="mt-1 block text-small text-sunsetOrange">
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className="mt-1 block text-small text-mutedText">
          {hint}
        </span>
      ) : null}
    </label>
  );
};
