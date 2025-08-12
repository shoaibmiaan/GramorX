import React, { useEffect } from 'react';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, className='' }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className={`card-surface rounded-ds-2xl w-full max-w-lg shadow-xl relative ${className}`}>
        {title && <div className="px-6 pt-5 pb-3 border-b border-gray-200 dark:border-white/10 text-h3 font-semibold">{title}</div>}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 pt-3 pb-5 border-t border-gray-200 dark:border-white/10">{footer}</div>}
        <button onClick={onClose} className="absolute top-3 right-3 rounded-ds p-2 hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Close">
          <i className="fas fa-times" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
