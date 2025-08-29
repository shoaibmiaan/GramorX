import React from 'react';

export type SpinnerProps = {
  size?: number;
  className?: string;
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 16, className = '' }) => (
  <span
    aria-hidden
    className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    style={{ width: size, height: size }}
  />
);

export default Spinner;
