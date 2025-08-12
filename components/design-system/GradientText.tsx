import React from 'react';
export const GradientText: React.FC<React.PropsWithChildren<{className?:string}>> = ({children, className=''}) => (
  <span className={`text-gradient-primary ${className}`}>{children}</span>
);
