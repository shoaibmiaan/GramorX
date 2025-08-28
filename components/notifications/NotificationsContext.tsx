import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export type Notification = {
  id: string;
  read: boolean;
  [key: string]: any;
};

interface NotificationsContextValue {
  notifications: Notification[];
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsCtx = createContext<NotificationsContextValue | null>(null);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();
    if (!user) {
      setNotifications([]);
      return;
    }
    const { data } = await supabaseBrowser
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setNotifications((data as Notification[]) ?? []);
  }, []);

  const markAllRead = useCallback(async () => {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();
    if (!user) return;
    await supabaseBrowser
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    let channel: ReturnType<typeof supabaseBrowser.channel> | null = null;
    (async () => {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();
      if (!user) return;
      channel = supabaseBrowser
        .channel('notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          fetchNotifications,
        )
        .subscribe();
    })();
    return () => {
      if (channel) supabaseBrowser.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const value = useMemo(
    () => ({ notifications, refresh: fetchNotifications, markAllRead }),
    [notifications, fetchNotifications, markAllRead],
  );

  return <NotificationsCtx.Provider value={value}>{children}</NotificationsCtx.Provider>;
};

export function useNotifications() {
  const ctx = useContext(NotificationsCtx);
  if (!ctx) throw new Error('useNotifications must be used within <NotificationsProvider>');
  return ctx;
}

export default NotificationsProvider;
