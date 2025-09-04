// components/design-system/Button.tsx
import * as React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;          // if provided => Link (internal) or <a> (external)
  external?: boolean;     // force external <a>
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  animated?: boolean;     // enables shine/lift/gradient drift
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm rounded-ds',
  md: 'px-8 py-3 rounded-full',
  lg: 'px-10 py-4 text-base rounded-full',
  xl: 'px-12 py-5 text-h3 rounded-full',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost:
    'bg-transparent text-electricBlue border border-electricBlue/30 hover:bg-electricBlue/10 dark:border-electricBlue/30',
  // keep link style minimal (no padding/radius); rely on typography utilities
  link: 'bg-transparent p-0 rounded-none text-electricBlue underline underline-offset-4 hover:opacity-90',
};

const Spinner: React.FC = () => (
  <span
    aria-hidden="true"
    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-foreground/60 border-t-foreground mr-2"
  />
);

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      href,
      external,
      fullWidth,
      loading,
      disabled,
      leadingIcon,
      trailingIcon,
      animated = true,
      className = '',
      children,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const base =
      'btn focus:outline-none focus-visible:ring-2 focus-visible:ring-electricBlue/40 disabled:opacity-60 disabled:cursor-not-allowed';
    const fx = animated ? 'btn--fx' : '';

    // link variant should not inherit padded sizes
    const sizeCls = variant === 'link' ? '' : sizeClasses[size];

    const cls = [
      base,
      fx,
      sizeCls,
      variantClasses[variant],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    const content = (
      <>
        {loading && <Spinner />}
        {!loading && leadingIcon ? <span className="mr-2 inline-flex">{leadingIcon}</span> : null}
        <span>{loading ? 'Please wait…' : children}</span>
        {!loading && trailingIcon ? <span className="ml-2 inline-flex">{trailingIcon}</span> : null}
      </>
    );

    const dataAttrs = {
      'data-variant': variant,
      'data-size': size,
      'data-loading': loading ? '' : undefined,
    } as const;

    // Link render (inert when disabled/loading)
    if (href) {
      const inert = disabled || loading;
      const isInternal = !external && (href.startsWith('/') || href.startsWith('#'));

      if (isInternal) {
        return (
          <Link
            href={href}
            aria-disabled={inert || undefined}
            tabIndex={inert ? -1 : undefined}
            className={inert ? cls + ' pointer-events-none' : cls}
            ref={ref as React.Ref<HTMLAnchorElement>}
            {...dataAttrs}
          >
            {content}
          </Link>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={inert || undefined}
          tabIndex={inert ? -1 : undefined}
          className={inert ? cls + ' pointer-events-none' : cls}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...dataAttrs}
        >
          {content}
        </a>
      );
    }

    // Button render
    return (
      <button
        type={type}
        className={cls}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...dataAttrs}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
