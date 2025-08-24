// components/design-system/Card.tsx
import React from 'react';

type Variant = 'surface' | 'glass';

export const Card: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }
> = ({ variant = 'surface', className = '', children, ...rest }) => {
  const base = variant === 'glass' ? 'card-glass' : 'card-surface';
  return (
    <div className={`${base} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};

export default Card;
