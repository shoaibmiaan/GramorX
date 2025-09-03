'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface UserInfo {
  id: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export function useHeaderState(initialStreak?: number) {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo>({ id: null, email: null, name: null, avatarUrl: null });

  // Streak (prop wins; otherwise fetch)
  const [streak, setStreak] = useState<number>(initialStreak ?? 0);
  useEffect(() => {
    if (typeof initialStreak === 'number') setStreak(initialStreak);
  }, [initialStreak]);
  const fetchStreak = useCallback(async () => {
    if (typeof initialStreak === 'number') return;
    const { data: session } = await supabaseBrowser.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) return;
    const res = await fetch('/api/words/today', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const j = await res.json();
      if (typeof j?.streakDays === 'number') setStreak(j.streakDays);
    }
  }, [initialStreak]);
  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);
  useEffect(() => {
    const onChanged = (e: Event) => {
      const ce = e as CustomEvent<{ value?: number }>;
      if (typeof ce.detail?.value === 'number') setStreak(ce.detail.value);
      else fetchStreak();
    };
    window.addEventListener('streak:changed', onChanged as EventListener);
    return () => window.removeEventListener('streak:changed', onChanged as EventListener);
  }, [fetchStreak]);

  useEffect(() => {
    let cancelled = false;
    const computeRole = async (uid: string | null, appMeta?: any, userMeta?: any) => {
      let r: any = appMeta?.role ?? userMeta?.role ?? null;
      if (!r && uid) {
        const { data: prof } = await supabaseBrowser.from('profiles').select('role').eq('id', uid).single();
        r = prof?.role ?? null;
      }
      return r ? String(r).toLowerCase() : null;
    };

    const sync = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      const s = data.session?.user ?? null;
      const userMeta = (s?.user_metadata ?? {}) as Record<string, unknown>;
      if (!cancelled) {
        setUser({
          id: s?.id ?? null,
          email: s?.email ?? null,
          name: typeof userMeta['full_name'] === 'string' ? (userMeta['full_name'] as string) : null,
          avatarUrl: typeof userMeta['avatar_url'] === 'string' ? (userMeta['avatar_url'] as string) : null,
        });
        const r = await computeRole(s?.id ?? null, s?.app_metadata, userMeta);
        if (!cancelled) setRole(r);
        setReady(true);
      }
    };
    sync();

    const { data: sub } = supabaseBrowser.auth.onAuthStateChange(
      async (_e: AuthChangeEvent, session: Session | null) => {
        const s = session?.user ?? null;
        const userMeta = (s?.user_metadata ?? {}) as Record<string, unknown>;
        setUser({
          id: s?.id ?? null,
          email: s?.email ?? null,
          name: typeof userMeta['full_name'] === 'string' ? (userMeta['full_name'] as string) : null,
          avatarUrl: typeof userMeta['avatar_url'] === 'string' ? (userMeta['avatar_url'] as string) : null,
        });
        const r = await computeRole(s?.id ?? null, s?.app_metadata, userMeta);
        setRole(r);
        if (!s) setStreak(0);
      }
    );

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onAvatarChanged = (e: Event) => {
      const ce = e as CustomEvent<{ url: string }>;
      setUser((u) => ({ ...u, avatarUrl: ce.detail.url }));
    };
    window.addEventListener('profile:avatar-changed', onAvatarChanged as EventListener);
    return () => window.removeEventListener('profile:avatar-changed', onAvatarChanged as EventListener);
  }, []);

  const signOut = useCallback(async () => {
    await supabaseBrowser.auth.signOut();
    setStreak(0);
    router.replace('/login');
  }, [router]);

  return { user, role, streak, ready, signOut };
}

