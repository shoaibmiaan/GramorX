import React from 'react';

export type TileGridProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Tailwind gap utility, e.g., "gap-4" */
  gap?: string;
  /** Tailwind grid column utilities, e.g., "sm:grid-cols-2 lg:grid-cols-5" */
  cols?: string;
  children?: React.ReactNode;
};

export const TileGrid: React.FC<TileGridProps> = ({
  gap = 'gap-4',
  cols = '',
  className = '',
  children,
  ...rest
}) => {
  const classes = ['grid', gap, cols, className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
};

export default TileGrid;
