import React from 'react';

type Variant = 'primary' | 'secondary' | 'accent';

type BaseProps = {
  variant?: Variant;
  className?: string;
  children?: React.ReactNode;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  BaseProps & {
    as?: 'button';
  };

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  BaseProps & {
    as: 'a';
    href?: string; // ← made optional
  };

type Props = ButtonProps | AnchorProps;

export const Button: React.FC<Props> = (props) => {
  const { variant = 'primary', className = '', children } = props;

  const base =
    'inline-flex items-center justify-center font-semibold transition rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
    (variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
      ? 'btn-secondary'
      : 'btn-accent');

  if (props.as === 'a') {
    const { as, href, onClick, ...rest } = props as AnchorProps;

    // Allow button-like anchors without href; keep a11y sane
    const role = href ? rest.role : (rest.role ?? 'button');
    const ariaDisabled = (rest as any)['aria-disabled'];

    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
      if (ariaDisabled || !href) {
        e.preventDefault();
        e.stopPropagation();
      }
      onClick?.(e);
    };

    return (
      <a
        href={href ?? '#'}
        role={role}
        aria-disabled={ariaDisabled}
        className={`${base} ${className}`}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </a>
    );
  }

  const { as, ...rest } = props as ButtonProps;
  return (
    <button className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
};
