import React from 'react';
import { Button } from '@/components/design-system/Button';

export type EmptyStateProps = {
  /** Heading text */
  title: string;
  /** Supporting text */
  description?: string;
  /** Optional leading icon/element */
  icon?: React.ReactNode;
  /** Optional primary action label (compat for existing usage) */
  actionLabel?: string;
  /** Click handler for the primary action (compat for existing usage) */
  onAction?: () => void;
  /** Extra classes */
  className?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`card-surface rounded-ds-2xl p-10 text-center mx-auto max-w-2xl ${className}`}>
      {icon && (
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-ds bg-purpleVibe/10 text-purpleVibe">
          {icon}
        </div>
      )}
      <h2 className="font-slab text-h2 mb-2">{title}</h2>
      {description && <p className="text-body text-grayish mb-6">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-2">
          <Button variant="primary" onClick={onAction} className="rounded-ds-xl">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
