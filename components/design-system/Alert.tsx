import React from 'react';

type Variant = 'info' | 'success' | 'warning' | 'error';

export const Alert: React.FC<{
  title?: string;
  children?: React.ReactNode;
  variant?: Variant;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, children, variant = 'info', icon, className = '' }) => {
  const variants: Record<Variant, string> = {
    info: 'bg-electricBlue/10 border-electricBlue/30 text-electricBlue',
    success: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-goldenYellow/10 border-goldenYellow/30 text-goldenYellow',
    error: 'bg-sunsetOrange/10 border-sunsetOrange/30 text-sunsetOrange',
  };
  return (
    <div role="alert" aria-live="polite" className={`card-surface border ${variants[variant]} p-5 rounded-ds ${className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {icon ?? (
            variant === 'success' ? <i className="fas fa-check-circle" /> :
            variant === 'warning' ? <i className="fas fa-exclamation-triangle" /> :
            variant === 'error' ? <i className="fas fa-times-circle" /> :
            <i className="fas fa-info-circle" />
          )}
        </div>
        <div>
          {title && <div className="font-semibold mb-1">{title}</div>}
          {children && <div className="text-body opacity-90">{children}</div>}
        </div>
      </div>
    </div>
  );
};
