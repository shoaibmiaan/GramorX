import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  const [hasSession, setHasSession] = useState(false);
  const toast = useToast();

  // Works whether supabaseBrowser is an instance or a factory
  const supabase = useMemo(() => {
    const maybeFn = supabaseBrowser as unknown as (() => any) | object;
    return typeof maybeFn === 'function' ? (maybeFn as any)() : (maybeFn as any);
  }, []);

  // Track auth state (initial + changes). Clear notifications on logout.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) setHasSession(!!session);
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
      if (!session) setNotifications([]);
    });

    return () => {
      subscription.subscription.unsubscribe();
      cancelled = true;
    };
  }, [supabase]);

  // Initial load (only when logged in)
  useEffect(() => {
    if (!hasSession) return;
    let active = true;

    (async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const data = await res.json();
        if (active) setNotifications(data.notifications ?? data.items ?? []);
      } catch {
        /* noop */
      }
    })();

    return () => { active = false; };
  }, [hasSession]);

  // Realtime subscription (only when logged in)
  useEffect(() => {
    if (!hasSession) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload: any) => {
          const n = payload.new as Notification;
          setNotifications((prev) => [n, ...prev]);
          toast.info(n.title ?? 'Notification', n.body ?? undefined);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [hasSession, supabase, toast]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
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
