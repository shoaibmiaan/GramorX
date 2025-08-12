import React from 'react';

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon, className='' }) => {
  return (
    <div className={`card-surface rounded-ds-2xl p-8 text-center ${className}`}>
      <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-ds bg-purpleVibe/10 text-purpleVibe">
        {icon ?? <i className="fas fa-inbox" aria-hidden="true" />}
      </div>
      <h3 className="text-h3 font-semibold mb-1">{title}</h3>
      {description && <p className="text-gray-600 dark:text-grayish mb-4">{description}</p>}
      {action}
    </div>
  );
};
