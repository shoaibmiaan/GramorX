import React from 'react';

export type Tab = { key: string; label: string; disabled?: boolean };
export type TabsProps = {
  tabs: Tab[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
};

export const Tabs: React.FC<TabsProps> = ({ tabs, value, onChange, className='' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-white/10">
        {tabs.map(t => {
          const active = value === t.key;
          const base = 'px-4 py-2 rounded-ds-t font-medium';
          const styles = active
            ? 'text-primary border-b-2 border-primary dark:text-electricBlue dark:border-electricBlue'
            : 'text-gray-600 dark:text-grayish hover:text-lightText dark:hover:text-white';
          return (
            <button
              key={t.key}
              disabled={t.disabled}
              onClick={() => onChange(t.key)}
              className={`${base} ${styles} disabled:opacity-50`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
