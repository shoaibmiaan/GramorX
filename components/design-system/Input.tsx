import React from 'react';

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
  ...props
}) => {
  const id = React.useId();
  const feedbackId = `${id}-feedback`;
  const base = [
    'w-full rounded-ds border bg-white text-lightText placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
    'disabled:opacity-60',
    'dark:bg-dark/50 dark:text-white dark:placeholder-white/40',
    'dark:border-purpleVibe/30 dark:focus:ring-electricBlue dark:focus:border-electricBlue',
  ].join(' ');
  const invalid = error ? 'border-sunsetOrange focus:ring-sunsetOrange focus:border-sunsetOrange' : '';

  return (
    <div className={`block ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish"
        >
          {label}
        </label>
      )}
      <div className={`relative flex items-center ${error ? 'text-sunsetOrange' : ''}`}>
        {iconLeft && <span className="absolute left-3 text-gray-500 dark:text-white/50">{iconLeft}</span>}
        <input
          id={id}
          className={`${base} ${invalid} ${iconLeft ? 'pl-10' : 'pl-4'} ${iconRight ? 'pr-10' : 'pr-4'} py-3`}
          aria-describedby={error || hint ? feedbackId : undefined}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {iconRight && <span className="absolute right-3 text-gray-500 dark:text-white/50">{iconRight}</span>}
      </div>
      {error ? (
        <span
          id={feedbackId}
          aria-live="polite"
          className="mt-1 block text-small text-sunsetOrange"
        >
          {error}
        </span>
      ) : hint ? (
        <span
          id={feedbackId}
          className="mt-1 block text-small text-gray-600 dark:text-grayish"
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
};
