'use client';

import React from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { Container } from '@/components/design-system/Container';
import { NavLink } from '@/components/design-system/NavLink';
import { NotificationBell } from '@/components/design-system/NotificationBell';
import { FireStreak } from './FireStreak';
import { IconOnlyThemeToggle } from './IconOnlyThemeToggle';
import { MODULE_LINKS, NAV } from './constants';

interface UserInfo {
  id: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

interface MobileNavProps {
  user: UserInfo;
  role: string | null;
  ready: boolean;
  streak: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  mobileModulesOpen: boolean;
  setMobileModulesOpen: (open: boolean) => void;
  signOut: () => Promise<void>;
}

export function MobileNav({ user, role, ready, streak, mobileOpen, setMobileOpen, mobileModulesOpen, setMobileModulesOpen, signOut }: MobileNavProps) {
  const overlay = (
    <div
      className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity ${mobileOpen ? '' : 'pointer-events-none opacity-0'}`}
      onClick={() => setMobileOpen(false)}
    />
  );

  const panel = mobileOpen ? (
    <div className="relative z-50 md:hidden border-t border-border bg-background shadow-lg">
      <Container>
        <div className="py-3 flex items-center justify-between">
          <FireStreak value={streak} />
          {ready && user.id ? (
            <div className="flex items-center gap-2">
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
              >
                Sign out
              </button>
            </div>
          ) : ready ? (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
          ) : (
            <div className="h-9 w-24 rounded-full bg-muted animate-pulse" />
          )}
        </div>

        <nav aria-label="Mobile Navigation" className="pb-4">
          <ul className="flex flex-col gap-1">
            {user.id && (
              <li>
                <NavLink
                  href="/dashboard"
                  className="block px-3 py-3 rounded-lg hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                href="/learning"
                className="block px-3 py-3 rounded-lg hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                Learning
              </NavLink>
            </li>
            <li>
              <button
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted"
                onClick={() => setMobileModulesOpen(!mobileModulesOpen)}
                aria-expanded={mobileModulesOpen}
                aria-controls="mobile-modules-list"
              >
                <span className="font-medium">Modules</span>
                <svg className="w-3.5 h-3.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d={mobileModulesOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
                </svg>
              </button>
              {mobileModulesOpen && (
                <ul id="mobile-modules-list" className="mt-1 ml-2 rounded-lg border border-border overflow-hidden">
                  {MODULE_LINKS.map((m) => (
                    <li key={m.href}>
                      <NavLink
                        href={m.href}
                        className="block px-4 py-3 hover:bg-muted"
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
                  className="block px-3 py-3 rounded-lg hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
            {role === 'partner' || role === 'admin' ? (
              <li>
                <NavLink
                  href="/partners"
                  className="block px-3 py-3 rounded-lg hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Partners
                </NavLink>
              </li>
            ) : null}
            {role === 'admin' ? (
              <li>
                <NavLink
                  href="/admin/partners"
                  className="block px-3 py-3 rounded-lg hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Admin
                </NavLink>
              </li>
            ) : null}
            {user.id ? (
              <>
                <li>
                  <NavLink
                    href="/account/billing"
                    className="block px-3 py-3 rounded-lg hover:bg-muted"
                    onClick={() => setMobileOpen(false)}
                  >
                    Billing
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/account/referrals"
                    className="block px-3 py-3 rounded-lg hover:bg-muted"
                    onClick={() => setMobileOpen(false)}
                  >
                    Referrals
                  </NavLink>
                </li>
              </>
            ) : null}
          </ul>
        </nav>
      </Container>
    </div>
  ) : null;

  return (
    <>
      <div className="flex items-center gap-2 md:hidden">
        <NotificationBell />
        <IconOnlyThemeToggle />
        <button
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
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
      {typeof document !== 'undefined' ? createPortal(<>{overlay}{panel}</>, document.body) : null}
    </>
  );
}
