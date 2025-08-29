import React from 'react';

export type ProgressBarProps = {
  value: number; // 0..100
  label?: string;
  className?: string;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, className='' }) => {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full ${className}`}>
      {label && <div className="mb-1 text-small text-mutedText">{label}</div>}
      <div className="h-2 w-full rounded-ds bg-border dark:bg-border/20 overflow-hidden">
        <div
          className="h-full rounded-ds bg-primary dark:bg-electricBlue transition-[width] duration-300"
          style={{ width: `${v}%` }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={v}
          role="progressbar"
        />
      </div>
    </div>
  );
};
