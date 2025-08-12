import React from 'react';
export const Card: React.FC<React.PropsWithChildren<{className?:string}>> = ({children, className=''}) => (
  <div className={`card-surface ${className}`}>{children}</div>
);
