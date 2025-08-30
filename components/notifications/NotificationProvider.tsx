import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useToast } from '@/components/design-system/Toaster';

export type Notification = {
  id: string;
  title: string | null;
  body: string | null;
  read_at: string | null;
  created_at: string;
  url?: string | null;
};

type Ctx = {
  notifications: Notification[];
  unread: number;
  markRead: (id: string) => Promise<void>;
};

const NotificationCtx = createContext<Ctx | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const toast = useToast();

  // initial load
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const data = await res.json();
        if (active) setNotifications(data.notifications ?? []);
      } catch {
        /* noop */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // realtime subscription
  useEffect(() => {
    const channel = supabaseBrowser
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const n = payload.new as Notification;
        setNotifications((prev) => [n, ...prev]);
        toast.info(n.title ?? 'Notification', n.body ?? undefined);
      })
      .subscribe();
    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [toast]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    } catch {
      /* noop */
    }
  }, []);

  const unread = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications]);

  const value = useMemo(() => ({ notifications, unread, markRead }), [notifications, unread, markRead]);

  return <NotificationCtx.Provider value={value}>{children}</NotificationCtx.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationCtx);
  if (!ctx) throw new Error('useNotifications must be used within <NotificationProvider>');
  return ctx;
}
