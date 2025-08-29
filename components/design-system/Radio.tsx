import React from 'react';

export type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Radio: React.FC<RadioProps> = ({ label, hint, error, className = '', ...props }) => {
  return (
    <label className={`flex items-start gap-3 ${className}`}>
      <input
        type="radio"
        className={[
          'mt-1 h-5 w-5 border rounded-full',
          'text-primary focus:ring-2 focus:ring-primary focus:outline-none',
          'dark:bg-dark/50 dark:border-purpleVibe/30 dark:focus:ring-electricBlue',
          error ? 'border-sunsetOrange focus:ring-sunsetOrange' : 'border-border'
        ].join(' ')}
        {...props}
      />
      <div>
        {label && <div className="text-body">{label}</div>}
        {error ? (
          <div className="text-small text-sunsetOrange">{error}</div>
        ) : hint ? (
          <div className="text-small text-mutedText">{hint}</div>
        ) : null}
      </div>
    </label>
  );
};
