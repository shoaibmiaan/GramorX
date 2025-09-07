// components/design-system/Skeleton.tsx
import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-pulse rounded bg-border/50 dark:bg-card/20 ${className}`} />;
};
