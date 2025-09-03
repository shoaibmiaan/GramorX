'use client';

import Link from 'next/link';
import { NavLink } from '@/components/design-system/NavLink';
import { UserMenu } from '@/components/design-system/UserMenu';
import { NotificationBell } from '@/components/design-system/NotificationBell';
import { ModuleMenu } from './ModuleMenu';
import { FireStreak } from './FireStreak';
import { IconOnlyThemeToggle } from './IconOnlyThemeToggle';
import { NAV } from './constants';
import React from 'react';

interface UserInfo {
  id: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

interface DesktopNavProps {
  user: UserInfo;
  role: string | null;
  ready: boolean;
  streak: number;
  openModules: boolean;
  setOpenModules: (open: boolean) => void;
  modulesRef: React.RefObject<HTMLLIElement>;
  signOut: () => Promise<void>;
}

export function DesktopNav({ user, role, ready, streak, openModules, setOpenModules, modulesRef, signOut }: DesktopNavProps) {
  return (
    <nav className="hidden md:block" aria-label="Primary">
      <ul className="flex items-center gap-3 relative">
        {user.id && <li><NavLink href="/dashboard" label="Dashboard" /></li>}
        <ModuleMenu open={openModules} setOpen={setOpenModules} modulesRef={modulesRef} />
        <li><NavLink href="/learning" label="Learning" /></li>
        {NAV.map((n) => (
          <li key={n.href}><NavLink href={n.href} label={n.label} /></li>
        ))}
        {role === 'partner' || role === 'admin' ? (
          <li><NavLink href="/partners" label="Partners" /></li>
        ) : null}
        {role === 'admin' ? <li><NavLink href="/admin/partners" label="Admin" /></li> : null}
        {ready ? (
          user.id ? (
            <li>
              <UserMenu
                userId={user.id}
                email={user.email}
                name={user.name}
                avatarUrl={user.avatarUrl}
                onSignOut={signOut}
                links={[
                  { href: '/account/billing', label: 'Billing' },
                  { href: '/account/referrals', label: 'Referrals' },
                ]}
              />
            </li>
          ) : (
            <li>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
              >
                Sign in
              </Link>
            </li>
          )
        ) : (
          <li><div className="h-9 w-24 rounded-full bg-muted animate-pulse" /></li>
        )}
        <li><FireStreak value={streak} /></li>
        <li><NotificationBell /></li>
        <li><IconOnlyThemeToggle /></li>
      </ul>
    </nav>
  );
}
