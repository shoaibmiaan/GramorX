import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

export type Notification = {
  id: string;
  message: string;
  url?: string;
  read?: boolean;
};

/** Notification bell with dropdown, fetch + mark-as-read, a11y-safe. */
export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Load notifications on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const data = await res.json();
        const list: Notification[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.notifications)
            ? data.notifications
            : [];
        if (!cancelled) setNotifications(list);
      } catch {
        /* noop */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
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

  const unread = useMemo(
    () => notifications.reduce((c, n) => c + (n.read ? 0 : 1), 0),
    [notifications]
  );

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    } catch {
      /* noop */
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    } catch {
      /* noop */
    }
  };

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
        <div
          ref={popoverRef}
          className="absolute right-0 mt-2 w-72 rounded-2xl border border-purpleVibe/20 bg-lightBg dark:bg-dark shadow-lg z-50"
        >
          <div className="flex items-center justify-between border-b border-purpleVibe/20 px-3 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-purpleVibe hover:underline">
                Mark all as read
              </button>
            )}
          </div>

          <ul id="notification-menu" role="menu" className="max-h-72 overflow-auto text-sm">
            {notifications.length === 0 ? (
              <li role="menuitem" className="px-3 py-3 opacity-80">
                No notifications
              </li>
            ) : (
              notifications.map((n) => {
                const isInternal = n.url?.startsWith('/');
                const row = (
                  <div className={`flex items-start gap-2 px-3 py-2 ${n.read ? 'opacity-60' : ''}`}>
                    <span className="flex-1">{n.message}</span>
                    {!n.read && (
                      <button
                        className="text-xs text-purpleVibe hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          markAsRead(n.id);
                        }}
                      >
                        Mark
                      </button>
                    )}
                  </div>
                );

                return (
                  <li key={n.id} role="menuitem" className="hover:bg-purpleVibe/5">
                    {n.url ? (
                      isInternal ? (
                        <Link
                          href={n.url}
                          className="block"
                          onClick={() => {
                            markAsRead(n.id);
                            setOpen(false);
                          }}
                        >
                          {row}
                        </Link>
                      ) : (
                        <a
                          href={n.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                          onClick={() => {
                            markAsRead(n.id);
                            setOpen(false);
                          }}
                        >
                          {row}
                        </a>
                      )
                    ) : (
                      <button className="block w-full text-left" onClick={() => markAsRead(n.id)}>
                        {row}
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
