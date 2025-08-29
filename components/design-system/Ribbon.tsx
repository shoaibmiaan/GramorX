import React from 'react';

type Variant = 'accent' | 'primary' | 'success' | 'warning';
type Position = 'top-right' | 'top-left';

const variantCls: Record<Variant, string> = {
  accent: 'from-sunsetOrange to-goldenYellow',
  primary: 'from-purpleVibe to-electricBlue',
  success: 'from-neonGreen to-success',
  warning: 'from-goldenYellow to-sunsetOrange',
};

const posWrap: Record<Position, string> = {
  'top-right': 'top-2 -right-10 rotate-45',
  'top-left': 'top-2 -left-10 -rotate-45',
};

export const Ribbon: React.FC<{
  label: string;
  variant?: Variant;
  position?: Position;
  className?: string;
}> = ({ label, variant = 'accent', position = 'top-right', className = '' }) => {
  return (
    <div
      className={`pointer-events-none absolute ${posWrap[position]} ${className}`}
      aria-hidden="true"
    >
      <span
        className={`inline-block py-1 px-8 text-xs font-bold tracking-wide text-primary-foreground bg-gradient-to-r ${variantCls[variant]} shadow-glow rounded-ds`}
      >
        {label}
      </span>
    </div>
  );
};
