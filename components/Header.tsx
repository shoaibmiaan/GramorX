'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { DesktopNav } from '@/components/navigation/DesktopNav';
import { MobileNav } from '@/components/navigation/MobileNav';


export const Header: React.FC<{ streak?: number }> = ({ streak }) => {
  const router = useRouter();

  const [openDesktopModules, setOpenDesktopModules] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileModulesOpen, setMobileModulesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string | null; email: string | null; name: string | null; avatarUrl: string | null }>({
    id: null, email: null, name: null, avatarUrl: null,
  });

  // Streak (prop wins; otherwise fetch)
  const [streakState, setStreakState] = useState<number>(streak ?? 0);
  useEffect(() => { if (typeof streak === 'number') setStreakState(streak); }, [streak]);
  const fetchStreak = useCallback(async () => {
    if (typeof streak === 'number') return;
    const { data: session } = await supabaseBrowser.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) return;
    const res = await fetch('/api/words/today', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { const j = await res.json(); if (typeof j?.streakDays === 'number') setStreakState(j.streakDays); }
  }, [streak]);
  useEffect(() => { fetchStreak(); }, [fetchStreak]);
  useEffect(() => {
    const onChanged = (e: Event) => {
      const ce = e as CustomEvent<{ value?: number }>;
      if (typeof ce.detail?.value === 'number') setStreakState(ce.detail.value);
      else fetchStreak();
    };
    window.addEventListener('streak:changed', onChanged as EventListener);
    return () => window.removeEventListener('streak:changed', onChanged as EventListener);
  }, [fetchStreak]);

  // Solid header when scrolled or any menu open
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const solidHeader = scrolled || openDesktopModules || mobileOpen;

  const modulesRef = useRef<HTMLLIElement>(null);

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
        if (!s) setStreakState(0);
      }
    );

    return () => { cancelled = true; sub?.subscription?.unsubscribe(); };
  }, []);

  useEffect(() => {
    const onAvatarChanged = (e: Event) => {
      const ce = e as CustomEvent<{ url: string }>;
      setUser((u) => ({ ...u, avatarUrl: ce.detail.url }));
    };
    window.addEventListener('profile:avatar-changed', onAvatarChanged as EventListener);
    return () => window.removeEventListener('profile:avatar-changed', onAvatarChanged as EventListener);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (modulesRef.current && !modulesRef.current.contains(t)) setOpenDesktopModules(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDesktopModules(false);
        setMobileOpen(false);
        setMobileModulesOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    if (mobileOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.addEventListener('touchmove', preventTouch, { passive: false });
    } else {
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', preventTouch);
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', preventTouch);
    };
  }, [mobileOpen]);

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    setStreakState(0);
    router.replace('/login');
  };

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-colors',
        solidHeader ? 'bg-background border-b border-border shadow-sm' : 'header-glass',
      ].join(' ')}
    >
      <Container>
        <div className="flex items-center justify-between py-4 md:py-5">
          {/* Brand */}
          <Link
            href={user.id ? '/dashboard' : '/'}
            className="flex items-center gap-3 group"
            aria-label="Go to home"
          >
            <Image
              src="/brand/logo.png"
              alt="GramorX logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-lg object-contain"
              priority
            />
            <span className="font-slab font-bold text-3xl">
              <span className="text-gradient-primary group-hover:opacity-90 transition">GramorX</span>
            </span>
          </Link>

          <DesktopNav
            user={user}
            role={role}
            ready={ready}
            streak={streakState}
            openModules={openDesktopModules}
            setOpenModules={setOpenDesktopModules}
            modulesRef={modulesRef}
            signOut={signOut}
          />
          <MobileNav
            user={user}
            role={role}
            ready={ready}
            streak={streakState}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            mobileModulesOpen={mobileModulesOpen}
            setMobileModulesOpen={setMobileModulesOpen}
            signOut={signOut}
          />
        </div>
      </Container>
    </header>
  );
};
