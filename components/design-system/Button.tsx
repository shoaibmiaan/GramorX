// components/design-system/Button.tsx
import React, { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}) => {
  const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ');
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
};
