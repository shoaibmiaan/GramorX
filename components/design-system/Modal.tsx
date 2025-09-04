import React, { useEffect, useRef, useId } from 'react';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, className = '' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) {
          e.preventDefault();
          modalRef.current.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const focusable = modalRef.current?.querySelector<HTMLElement>(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      (focusable ?? modalRef.current)?.focus();
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/30 dark:bg-dark/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={children ? bodyId : undefined}
        ref={modalRef}
        tabIndex={-1}
        className={`card-surface rounded-ds-2xl w-full max-w-lg shadow-xl relative ${className}`}
      >
        {title && (
          <div
            id={titleId}
            className="px-6 pt-5 pb-3 border-b border-border dark:border-vibrantPurple/20 text-h3 font-semibold"
          >
            {title}
          </div>
        )}
        <div id={children ? bodyId : undefined} className="px-6 py-5">
          {children}
        </div>
        {footer && <div className="px-6 pt-3 pb-5 border-t border-border dark:border-vibrantPurple/20">{footer}</div>}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-ds p-2 hover:bg-border/20 dark:hover:bg-border/20"
          aria-label="Close"
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
