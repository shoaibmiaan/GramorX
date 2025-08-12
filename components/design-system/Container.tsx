import React from 'react';

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <div ref={ref} className={`container ${className}`} {...rest}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
