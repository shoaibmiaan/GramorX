import React from 'react';

type Variant = 'primary' | 'secondary' | 'accent';

type ButtonOrLinkProps =
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' })
  | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' });

export const Button: React.FC<ButtonOrLinkProps & { variant?: Variant; className?: string }> = ({
  variant = 'primary',
  as = 'button',
  className = '',
  children,
  ...props
}) => {
  const base = 'btn ' + (variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-accent');
  const Element = (as === 'a' ? 'a' : 'button') as any;
  return (
    <Element className={`${base} ${className}`} {...(props as any)}>
      {children}
    </Element>
  );
};
