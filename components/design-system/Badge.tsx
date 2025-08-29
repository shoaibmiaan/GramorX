import React from 'react';

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type Size = 'sm' | 'md';

export const Badge: React.FC<{
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}> = ({ variant = 'neutral', size = 'md', className = '', children }) => {
  const sizes: Record<Size, string> = {
    sm: 'text-small px-2.5 py-1 rounded-ds',
    md: 'text-body px-3.5 py-1.5 rounded-ds',
  };
  const variants: Record<Variant, string> = {
    neutral: 'bg-border text-lightText dark:bg-border/20 dark:text-foreground',
    success: 'bg-success/15 text-success border border-success/30',
    warning: 'bg-goldenYellow/15 text-goldenYellow border border-goldenYellow/30',
    danger: 'bg-sunsetOrange/15 text-sunsetOrange border border-sunsetOrange/30',
    info: 'bg-electricBlue/15 text-electricBlue border border-electricBlue/30',
  };
  return (
    <span className={`${sizes[size]} ${variants[variant]} inline-flex items-center gap-2 ${className}`}>
      {children}
    </span>
  );
};
