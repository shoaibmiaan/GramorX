// components/sections/Header.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { ThemeToggle } from '@/components/design-system/ThemeToggle';
import { StreakIndicator } from '@/components/design-system/StreakIndicator';
import { NavLink } from '@/components/design-system/NavLink';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { UserMenu } from '@/components/design-system/UserMenu';

const MODULE_LINKS = [
  { label: 'Learning', href: '/learning', desc: 'Lessons, tips & progress' },
  { label: 'Listening', href: '/listening', desc: 'Audio comprehension drills' },
  { label: 'Reading', href: '/reading', desc: 'Short passages & skimming' },
  { label: 'Writing', href: '/writing', desc: 'Prompts, structure & style' },
  { label: 'Speaking', href: '/speaking', desc: 'Pronunciation & fluency' },
];

// NOTE: “Success Stories” removed
const NAV = [
  { href: '#pricing', label: 'Pricing' },
  { href: '#waitlist', label: 'Join Waitlist' },
];

export const Header: React.FC<{ streak: number }> = ({ streak }) => {
  const router = useRouter();

  // UI state
  const [openDesktopModules, setOpenDesktopModules] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileModulesOpen, setMobileModulesOpen] = useState(false);

  // Auth state
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{
    id: string | null;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
  }>({ id: null, email: null, name: null, avatarUrl: null });

  // Refs
  const modulesRef = useRef<HTMLLIElement>(null);

  // Load session + subscribe to changes
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!cancelled) {
        const s = data.session?.user;
        setUser({
          id: s?.id ?? null,
          email: s?.email ?? null,
          name: (s?.user_metadata as any)?.full_name ?? null,
          avatarUrl: (s?.user_metadata as any)?.avatar_url ?? null,
        });
        setReady(true);
      }
    };
    sync();
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_e, session) => {
      const s = session?.user;
      setUser({
        id: s?.id ?? null,
        email: s?.email ?? null,
        name: (s?.user_metadata as any)?.full_name ?? null,
        avatarUrl: (s?.user_metadata as any)?.avatar_url ?? null,
      });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Close dropdowns on outside click / Esc
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

  // Prevent body scroll when mobile menu open
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
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-50 header-glass">
      <Container>
        <div className="flex items-center justify-between py-4 md:py-5">
          {/* Brand */}
          <a href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="GramorX logo" className="h-9 w-9 rounded-lg object-contain" />
            <span className="font-slab font-bold text-2xl">
              <span className="text-gradient-primary group-hover:opacity-90 transition">GramorX</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-3 relative">
              {/* Modules mega menu (desktop) */}
              <li className="relative" ref={modulesRef}>
                <button
                  onClick={() => setOpenDesktopModules((v) => !v)}
                  aria-expanded={openDesktopModules}
                  aria-haspopup="menu"
                  aria-controls="desktop-modules-menu"
                  className="px-3 py-2 rounded hover:bg-purpleVibe/10 flex items-center gap-2"
                >
                  Modules
                  <i className={`fas fa-chevron-${openDesktopModules ? 'up' : 'down'} text-xs`} />
                </button>

                {openDesktopModules && (
                  <div
                    id="desktop-modules-menu"
                    role="menu"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[880px] max-w-[90vw] bg-lightBg dark:bg-dark border border-purpleVibe/20 rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="grid grid-cols-12">
                      {/* Left: menu columns */}
                      <div className="col-span-8 p-6 sm:p-7">
                        <div className="mb-3">
                          <h3 className="font-slab text-h3">Skill Modules</h3>
                          <p className="text-grayish text-small">Build the core exam skills with focused practice.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {MODULE_LINKS.map((m) => (
                            <a
                              key={m.href}
                              href={m.href}
                              className="group rounded-ds border border-transparent hover:border-purpleVibe/20 p-4 flex items-start gap-3 hover:bg-purpleVibe/10"
                              onClick={() => setOpenDesktopModules(false)}
                            >
                              <div className="mt-1">
                                <i className="fas fa-arrow-right" aria-hidden />
                              </div>
                              <div>
                                <div className="font-medium">{m.label}</div>
                                {m.desc && <div className="text-small text-grayish">{m.desc}</div>}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Right: callout */}
                      <div className="col-span-4 bg-purpleVibe/5 dark:bg-purpleVibe/10 p-6 sm:p-7 flex flex-col justify-between">
                        <div>
                          <div className="mb-2 font-slab text-h3">New here?</div>
                          <p className="text-small opacity-80">Take a quick placement to get a personalized start.</p>
                        </div>
                        <a
                          href="/placement"
                          className="mt-4 inline-flex items-center justify-center rounded-ds-xl px-4 py-2 font-semibold text-white bg-gradient-to-r from-purpleVibe to-electricBlue hover:opacity-90"
                          onClick={() => setOpenDesktopModules(false)}
                        >
                          Start placement
                          <i className="fas fa-arrow-right ml-2 text-xs" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </li>

              {/* Learning hub entry */}
              <li><NavLink href="/learning" label="Learning" /></li>

              {/* Other links (Success Stories removed) */}
              {NAV.map((n) => (
                <li key={n.href}><NavLink href={n.href} label={n.label} /></li>
              ))}

              {/* Community link */}
              <li><NavLink href="/community" label="Community" /></li>

              {/* Auth area (Dashboard link removed) */}
              {ready ? (
                user.id ? (
                  <li>
                    <UserMenu
                      userId={user.id}
                      email={user.email}
                      name={user.name}
                      avatarUrl={user.avatarUrl}
                      onAvatarChange={(url) => setUser((u) => ({ ...u, avatarUrl: url }))}
                      onSignOut={signOut}
                      // (optional) You can pass custom items; default already contains Profile + Account + Sign out
                    />
                  </li>
                ) : (
                  <li>
                    <a
                      href="/login"
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-purpleVibe to-electricBlue text-white font-semibold hover:opacity-90 transition"
                    >
                      Sign in
                    </a>
                  </li>
                )
              ) : (
                <li><div className="h-9 w-24 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" /></li>
              )}

              {/* Tools */}
              <li><StreakIndicator value={streak} /></li>
              <li><ThemeToggle /></li>
            </ul>
          </nav>

          {/* Mobile right-side controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-purpleVibe/10"
            >
              {mobileOpen ? <i className="fas fa-times text-lg" /> : <i className="fas fa-bars text-lg" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-purpleVibe/20 bg-lightBg/95 dark:bg-dark/95 backdrop-blur-md">
          <Container>
            <div className="py-3 flex items-center justify-between">
              <StreakIndicator value={streak} />
              {ready && userEmail ? (
                <div className="flex items-center gap-2">
                  {/* Dashboard button removed on mobile as well */}
                  <button
                    onClick={signOut}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purpleVibe to-electricBlue text-white font-semibold hover:opacity-90 transition"
                  >
                    Sign out
                  </button>
                </div>
              ) : ready ? (
                <a
                  href="/login"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purpleVibe to-electricBlue text-white font-semibold hover:opacity-90 transition"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </a>
              ) : (
                <div className="h-9 w-24 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
              )}
            </div>

            <nav aria-label="Mobile Navigation" className="pb-4">
              <ul className="flex flex-col gap-1">
                <li>
                  <a
                    href="/learning"
                    className="block px-3 py-3 rounded-lg hover:bg-purpleVibe/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    Learning
                  </a>
                </li>

                {/* Modules accordion (mobile) */}
                <li>
                  <button
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-purpleVibe/10"
                    onClick={() => setMobileModulesOpen((v) => !v)}
                    aria-expanded={mobileModulesOpen}
                    aria-controls="mobile-modules-list"
                  >
                    <span className="font-medium">Modules</span>
                    <i className={`fas fa-chevron-${mobileModulesOpen ? 'up' : 'down'} text-xs`} />
                  </button>
                  {mobileModulesOpen && (
                    <ul id="mobile-modules-list" className="mt-1 ml-2 rounded-lg border border-purpleVibe/20 overflow-hidden">
                      {MODULE_LINKS.map((m) => (
                        <li key={m.href}>
                          <a
                            href={m.href}
                            className="block px-4 py-3 hover:bg-purpleVibe/10"
                            onClick={() => setMobileOpen(false)}
                          >
                            {m.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Success Stories removed; keep Pricing + Waitlist */}
                {NAV.map((n) => (
                  <li key={n.href}>
                    <a
                      href={n.href}
                      className="block px-3 py-3 rounded-lg hover:bg-purpleVibe/10"
                      onClick={() => setMobileOpen(false)}
                    >
                      {n.label}
                    </a>
                  </li>
                ))}

                <li>
                  <a
                    href="/community"
                    className="block px-3 py-3 rounded-lg hover:bg-purpleVibe/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    Community
                  </a>
                </li>
              </ul>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
};
