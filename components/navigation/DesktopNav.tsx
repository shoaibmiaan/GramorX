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

export function DesktopNav({
  user, role, ready, streak, openModules, setOpenModules, modulesRef, signOut,
}: DesktopNavProps) {
  return (
    <nav className="hidden md:block" aria-label="Primary">
      <ul className="relative flex items-center gap-2">
        {user.id && (
          <li>
            <NavLink href="/dashboard" className="px-3 py-2 rounded-lg hover:bg-muted" label="Dashboard" />
          </li>
        )}

        <ModuleMenu open={openModules} setOpen={setOpenModules} modulesRef={modulesRef} />

        <li>
          <NavLink href="/learning" className="px-3 py-2 rounded-lg hover:bg-muted" label="Learning" />
        </li>

        {NAV.map((n) => (
          <li key={n.href}>
            <NavLink href={n.href} className="px-3 py-2 rounded-lg hover:bg-muted" label={n.label} />
          </li>
        ))}

        {(role === 'partner' || role === 'admin') && (
          <li>
            <NavLink href="/partners" className="px-3 py-2 rounded-lg hover:bg-muted" label="Partners" />
          </li>
        )}
        {role === 'admin' && (
          <li>
            <NavLink href="/admin/partners" className="px-3 py-2 rounded-lg hover:bg-muted" label="Admin" />
          </li>
        )}

        {/* Right cluster */}
        <li className="ml-2">
          <FireStreak value={streak} />
        </li>
        <li>
          <NotificationBell />
        </li>
        <li>
          <IconOnlyThemeToggle />
        </li>

        <li className="ml-1">
          {ready ? (
            user.id ? (
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
            ) : (
              <Link
                href="/login"
                className="
                  inline-flex items-center justify-center rounded-full
                  px-4 py-2 font-semibold
                  bg-primary text-primary-foreground
                  hover:opacity-90 transition
                "
              >
                Sign in
              </Link>
            )
          ) : (
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          )}
        </li>
      </ul>
    </nav>
  );
}
