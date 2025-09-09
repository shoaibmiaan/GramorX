import React from 'react';

export type ToggleProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
};

export const Toggle: React.FC<ToggleProps> = ({ checked=false, onChange, label, hint, disabled, className='' }) => {
  return (
    <label className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={[
          'relative inline-flex h-6 w-11 items-center rounded-ds transition',
          checked ? 'bg-primary dark:bg-electricBlue' : 'bg-border dark:bg-border/20',
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-5 w-5 transform rounded-ds bg-card dark:bg-dark transition',
            checked ? 'translate-x-5' : 'translate-x-1'
          ].join(' ')}
        />
      </button>
      <div>
        {label && <div className="text-body">{label}</div>}
        {hint && <div className="text-small text-mutedText">{hint}</div>}
      </div>
    </label>
  );
};
