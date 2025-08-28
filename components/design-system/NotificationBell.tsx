import React, { useEffect, useRef, useState } from 'react';

/**
 * Notification bell with a dropdown list.
 * Shows an unread badge and accessible menu items.
 */
export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  // Placeholder unread count
  const [unread] = useState<number>(0);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="notification-menu"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-purpleVibe/10"
      >
        <i className="fas fa-bell" aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-live="polite"
            className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-sunsetOrange px-1 text-[10px] leading-none text-white"
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <ul
          id="notification-menu"
          role="menu"
          ref={menuRef}
          className="absolute right-0 mt-2 w-64 rounded-2xl border border-vibrantPurple/20 bg-lightBg dark:bg-dark shadow-lg"
        >
          <li role="menuitem" tabIndex={-1} className="px-4 py-3 text-sm">
            No new notifications
          </li>
        </ul>
      )}
    </div>
  );
};

export default NotificationBell;
