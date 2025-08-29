import React from 'react';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea: React.FC<TextareaProps> = ({ label, hint, error, className = '', ...props }) => {
  const base = [
    'form-control w-full rounded-ds border bg-white text-lightText placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
    'dark:bg-dark/50 dark:text-white dark:placeholder-white/40 dark:border-purpleVibe/30 dark:focus:ring-electricBlue dark:focus:border-electricBlue',
  ].join(' ');
  const invalid = error ? 'border-sunsetOrange focus:ring-sunsetOrange focus:border-sunsetOrange' : '';

  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">{label}</span>}
      <textarea className={`${base} ${invalid} p-4 min-h-[140px]`} {...props} />
      {error ? (
        <span className="mt-1 block text-small text-sunsetOrange">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-small text-gray-600 dark:text-grayish">{hint}</span>
      ) : null}
    </label>
  );
};
