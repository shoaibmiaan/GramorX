import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/design-system/Toast';

type Notification = {
  id: string;
  message: string;
  url?: string;
  read?: boolean;
};

/**
 * Notification bell with dropdown list.
 * Fetches notifications on mount and allows marking them as read.
 */
export const NotificationBell: React.FC = () => {
  const { info } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const data = await res.json();
        const list: Notification[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.notifications)
            ? data.notifications
            : [];
        if (!ignore) setNotifications(list);
      } catch {
        /* ignore */
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (open && dropdownRef.current && !dropdownRef.current.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    } catch {
      /* ignore */
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    } catch {
      /* ignore */
    }
  };

  const handleBellClick = () => {
    setOpen((v) => !v);
    if (notifications.length === 0) info('No notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={handleBellClick}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-purpleVibe/10"
      >
        <i className="fas fa-bell" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-purpleVibe/20 bg-lightBg dark:bg-dark shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-purpleVibe/20 px-3 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-purpleVibe hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <ul className="max-h-60 overflow-auto text-sm">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-2 px-3 py-2 ${n.read ? 'opacity-60' : ''}`}
              >
                <a
                  href={n.url ?? '#'}
                  onClick={() => markAsRead(n.id)}
                  className="flex-1 hover:underline"
                >
                  {n.message}
                </a>
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
