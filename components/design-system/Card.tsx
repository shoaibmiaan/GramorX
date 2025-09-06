// components/design-system/Card.tsx
import React from 'react';

type Variant = 'surface' | 'glass' | 'ghost';
type Padding = 'none' | 'sm' | 'md' | 'lg';
type Radius = 'ds' | 'ds-2xl' | 'xl' | 'full';
type Elevation = 'none' | 'glow' | 'glowLg';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  /** Inner padding scale (defaults to 'md') */
  padding?: Padding;
  /** Rounded tokens (defaults to 'ds-2xl') */
  rounded?: Radius;
  /** Subtle shadows via DS tokens */
  elevation?: Elevation;
  /** Adds transition + slight lift/glow when hovered (calm by default) */
  hoverable?: boolean;
  /** Apply borders between immediate children */
  divided?: boolean;
  /** Slimmer spacing & typography for dense layouts */
  compact?: boolean;
};

const cx = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(' ');

/** Base variant → token classes */
const variantCls: Record<Variant, string> = {
  surface:
    'card-surface bg-card text-card-foreground border border-border',
  glass:
    'card-glass bg-background/60 supports-[backdrop-filter]:backdrop-blur-md text-card-foreground border border-border',
  ghost:
    'bg-transparent text-foreground border border-border',
};

const paddingCls: Record<Padding, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-5',
  lg: 'p-6 sm:p-7',
};

const radiusCls: Record<Radius, string> = {
  ds: 'rounded-ds',
  'ds-2xl': 'rounded-ds-2xl',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const elevationCls: Record<Elevation, string> = {
  none: '',
  glow: 'shadow-glow',
  glowLg: 'shadow-glowLg',
};

export const Card: React.FC<CardProps> & {
  Header: React.FC<React.HTMLAttributes<HTMLDivElement> & { actions?: React.ReactNode }>;
  Body: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Footer: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Media: React.FC<React.HTMLAttributes<HTMLDivElement>>;
} = ({
  variant = 'surface',
  padding = 'md',
  rounded = 'ds-2xl',
  elevation = 'none',
  hoverable = false,
  divided = false,
  compact = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={cx(
        variantCls[variant],
        radiusCls[rounded],
        paddingCls[padding],
        elevationCls[elevation],
        divided && 'divide-y divide-border',
        hoverable && 'transition-all duration-200 will-change-transform hover:-translate-y-0.5 hover:shadow-glow',
        compact && 'p-4 sm:p-4',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

/** Sections (slot-style) — all tokenized and subtle */
Card.Header = ({ className = '', children, actions, ...rest }) => (
  <div
    className={cx(
      'flex items-start justify-between gap-3',
      'pb-3 sm:pb-4',
      className
    )}
    {...rest}
  >
    <div className="min-w-0">
      <div className="text-lg font-semibold leading-snug truncate">{children}</div>
    </div>
    {actions ? <div className="shrink-0 flex items-center gap-2">{actions}</div> : null}
  </div>
);

Card.Body = ({ className = '', children, ...rest }) => (
  <div className={cx('pt-3 sm:pt-4', className)} {...rest}>
    {children}
  </div>
);

Card.Footer = ({ className = '', children, ...rest }) => (
  <div
    className={cx(
      'pt-3 sm:pt-4',
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

/** Media block (hero image, charts, etc.) with edge-to-edge bleed */
Card.Media = ({ className = '', children, ...rest }) => (
  <div
    className={cx(
      // negative padding compensation for edge-to-edge feel
      '-mx-5 -mt-5 mb-4 overflow-hidden rounded-t-inherit',
      'supports-[backdrop-filter]:[mask-image:linear-gradient(to_bottom,black,black)]',
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
