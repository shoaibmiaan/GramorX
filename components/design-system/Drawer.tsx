import React, { useEffect } from 'react';

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: 'left'|'right'|'top'|'bottom';
  title?: string;
  children?: React.ReactNode;
  className?: string;
};

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, side='right', title, children, className='' }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pos = side === 'right' ? 'inset-y-0 right-0' :
              side === 'left' ? 'inset-y-0 left-0' :
              side === 'top' ? 'inset-x-0 top-0' : 'inset-x-0 bottom-0';

  const size = side === 'top' || side === 'bottom' ? 'h-[70vh] max-h-[90vh] w-full' : 'w-[420px] max-w-[90vw] h-full';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className={`absolute ${pos} ${size} card-surface shadow-xl ${className}`} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="rounded-ds p-2 hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Close">
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5 overflow-auto h-full">{children}</div>
      </div>
    </div>
  );
};
