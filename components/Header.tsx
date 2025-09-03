'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { DesktopNav } from '@/components/navigation/DesktopNav';
import { MobileNav } from '@/components/navigation/MobileNav';
import { useHeaderState } from '@/components/hooks/useHeaderState';

export const Header: React.FC<{ streak?: number }> = ({ streak }) => {
  const [openDesktopModules, setOpenDesktopModules] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileModulesOpen, setMobileModulesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Canonical source of truth for auth/role/streak/signOut
  const { user, role, streak: streakState, ready, signOut } = useHeaderState(streak);

  // Solid header when scrolled or any menu open
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const solidHeader = scrolled || openDesktopModules || mobileOpen;

  const modulesRef = useRef<HTMLLIElement>(null);

  // Click/Esc outside to close menus
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

  // Prevent background scroll when mobile menu is open
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
            href={user?.id ? '/dashboard' : '/'}
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
            <p className="font-slab font-bold text-3xl" role="heading" aria-level={1}>
              <span className="text-gradient-primary group-hover:opacity-90 transition">GramorX</span>
            </p>
          </Link>

          {/* Desktop Navigation (with Modules mega menu + Streak chip) */}
          <DesktopNav
            user={user}
            role={role}
            ready={ready}
            streak={streakState}
            openModules={openDesktopModules}
            setOpenModules={setOpenDesktopModules}
            modulesRef={modulesRef}
            signOut={signOut}
            // Hide Admin button regardless of role (implement inside DesktopNav)
            // @ts-expect-error TODO: add `showAdmin` prop to DesktopNav types
            showAdmin={false}
          />

          {/* Mobile Navigation (hamburger + overlay + Modules sheet) */}
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
            // @ts-expect-error TODO: add `showAdmin` prop to MobileNav types
            showAdmin={false}
          />
        </div>
      </Container>
    </header>
  );
};
