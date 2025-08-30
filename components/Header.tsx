'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { Container } from '@/components/design-system/Container';
import { NavLink } from '@/components/design-system/NavLink';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { UserMenu } from '@/components/design-system/UserMenu';
import dynamic from 'next/dynamic';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const NotificationBell = dynamic(
  () => import('@/components/design-system/NotificationBell'),
  { ssr: false }
);

type ModuleLink = { label: string; href: string; desc?: string };

const MODULE_LINKS: ModuleLink[] = [
  { label: 'Listening', href: '/listening', desc: 'Audio comprehension drills' },
  { label: 'Reading', href: '/reading', desc: 'Short passages & skimming' },
  { label: 'Writing', href: '/writing', desc: 'Prompts, structure & style' },
  { label: 'Speaking', href: '/speaking', desc: 'Pronunciation & fluency' },
];

const NAV: { href: string; label: string }[] = [
  { href: '/waitlist', label: 'Join Waitlist' },
  { href: '#pricing', label: 'Pricing' },
];

function FireStreak({ value }: { value: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 text-orange-300 px-2.5 py-1 text-sm font-semibold"
      title="Daily streak"
    >
      <span aria-hidden>🔥</span>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}

function IconOnlyThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (theme ?? resolvedTheme) === 'dark';
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-purpleVibe/10"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M6.76 4.84 5.34 3.42 3.92 4.84 5.34 6.26 6.76 4.84zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9-10v-2h-3v2h3zm-2.76 7.16 1.42 1.42 1.42-1.42-1.42-1.42-1.42 1.42zM12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm7-1.58 1.42-1.42L19 0.58l-1.42 1.42L19 3.42zM4.84 17.24 3.42 18.66l1.42 1.42 1.42-1.42-1.42-1.42z" />
        </svg>
      )}
    </button>
  );
}

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
        solidHeader ? 'bg-lightBg dark:bg-dark border-b border-purpleVibe/20 shadow-sm' : 'header-glass',
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
              priority
              sizes="44px"
              className="h-11 w-11 rounded-lg object-contain"
            />
            <span className="font-slab font-bold text-3xl">
              <span className="text-gradient-primary group-hover:opacity-90 transition">GramorX</span>
            </span>
          </Link>

          {/* Desktop */}
          <nav className="hidden md:block" aria-label="Primary">
            <ul className="flex items-center gap-3 relative">
              {user.id && <li><NavLink href="/dashboard" label="Dashboard" /></li>}
              <li className="relative" ref={modulesRef}>
                <button
                  onClick={() => setOpenDesktopModules(v => !v)}
                  aria-expanded={openDesktopModules}
                  aria-haspopup="menu"
                  aria-controls="desktop-modules-menu"
                  className="px-3 py-2 rounded hover:bg-purpleVibe/10 flex items-center gap-2"
                >
                  <span>Modules</span>
                  <svg className="w-3.5 h-3.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d={openDesktopModules ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
                  </svg>
                </button>

                {openDesktopModules && (
                  <div
                    id="desktop-modules-menu"
                    role="menu"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-220 max-w-[90vw] bg-lightBg dark:bg-dark border border-purpleVibe/20 rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="grid grid-cols-12">
                      <div className="col-span-8 p-6 sm:p-7">
                        <div className="mb-3">
                          <h3 className="font-slab text-h3">Skill Modules</h3>
                          <p className="text-grayish text-small">Build the core exam skills with focused practice.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {MODULE_LINKS.map((m) => (
                            <NavLink
                              key={m.href}
                              href={m.href}
                              className="group rounded-ds border border-transparent hover:border-purpleVibe/20 p-4 flex items-start gap-3 hover:bg-purpleVibe/10"
                              onClick={() => setOpenDesktopModules(false)}
                              role="menuitem"
                            >
                              <div className="mt-1">
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                  <path d="M5 12h14M13 5l7 7-7 7" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">{m.label}</div>
                                {m.desc && <div className="text-small text-grayish">{m.desc}</div>}
                              </div>
                            </NavLink>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-4 bg-purpleVibe/5 dark:bg-purpleVibe/10 p-6 sm:p-7 flex flex-col justify-between">
                        <div>
                          <div className="mb-2 font-slab text-h3">New here?</div>
                          <p className="text-small opacity-80">Take a quick placement to get a personalized start.</p>
                        </div>
                        <Link
                          href="/placement"
                          className="mt-4 inline-flex items-center justify-center rounded-ds-xl px-4 py-2 font-semibold text-white bg-gradient-to-r from-purpleVibe to-electricBlue hover:opacity-90"
                          onClick={() => setOpenDesktopModules(false)}
                          role="menuitem"
                        >
                          Start placement
                          <span className="ml-2 inline-flex">
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </li>

              <li><NavLink href="/learning" label="Learning" /></li>
              {NAV.map((n) => (<li key={n.href}><NavLink href={n.href} label={n.label} /></li>))}
              <li><NavLink href="/premium" label="premium" /></li>

              {ready ? (
                user.id ? (
                  <li>
                    <UserMenu
                      userId={user.id}
                      email={user.email}
                      name={user.name}
                      avatarUrl={user.avatarUrl}
                      onSignOut={signOut}
                    />
                  </li>
                ) : (
                  <li>
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-purpleVibe to-electricBlue text-white font-semibold hover:opacity-90 transition"
                    >
                      Sign in
                    </Link>
                  </li>
                )
              ) : (
                <li><div className="h-9 w-24 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" /></li>
              )}

              <li><FireStreak value={streakState} /></li>
              <li><NotificationBell /></li>
              <li><IconOnlyThemeToggle /></li>
            </ul>
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <NotificationBell />
            <IconOnlyThemeToggle />
            <button
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(v => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-purpleVibe/10"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-purpleVibe/20 bg-lightBg dark:bg-dark shadow-lg">
          <Container>
            <div className="py-3 flex items-center justify-between">
              <FireStreak value={streakState} />
              {ready && user.id ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={signOut}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purpleVibe to-electricBlue text-white font-semibold hover:opacity-90 transition"
                  >
                    Sign out
                  </button>
                </div>
              ) : ready ? (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purpleVibe to-electricBlue text-white font-semibold hover:opacity-90 transition"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </Link>
              ) : (
                <div className="h-9 w-24 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
              )}
            </div>

            <nav aria-label="Mobile Navigation" className="pb-4">
              <ul className="flex flex-col gap-1">
                {user.id && (
                  <li>
                    <NavLink
                      href="/dashboard"
                      className="block px-3 py-3 rounded-lg hover:bg-purpleVibe/10"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink
                    href="/learning"
                    className="block px-3 py-3 rounded-lg hover:bg-purpleVibe/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    Learning
                  </NavLink>
                </li>

                {/* Modules accordion */}
                <li>
                  <button
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-purpleVibe/10"
                    onClick={() => setMobileModulesOpen(v => !v)}
                    aria-expanded={mobileModulesOpen}
                    aria-controls="mobile-modules-list"
                  >
                    <span className="font-medium">Modules</span>
                    <svg className="w-3.5 h-3.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d={mobileModulesOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
                    </svg>
                  </button>
                  {mobileModulesOpen && (
                    <ul id="mobile-modules-list" className="mt-1 ml-2 rounded-lg border border-purpleVibe/20 overflow-hidden">
                      {MODULE_LINKS.map((m) => (
                        <li key={m.href}>
                          <NavLink
                            href={m.href}
                            className="block px-4 py-3 hover:bg-purpleVibe/10"
                            onClick={() => setMobileOpen(false)}
                          >
                            {m.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {NAV.map((n) => (
                  <li key={n.href}>
                    <NavLink
                      href={n.href}
                      className="block px-3 py-3 rounded-lg hover:bg-purpleVibe/10"
                      onClick={() => setMobileOpen(false)}
                    >
                      {n.label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <NavLink
                    href="/premium"
                    className="block px-3 py-3 rounded-lg hover:bg-purpleVibe/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    premium
                  </NavLink>
                </li>
              </ul>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
};
