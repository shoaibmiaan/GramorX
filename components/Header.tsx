'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { DesktopNav } from '@/components/navigation/DesktopNav';
import { MobileNav } from '@/components/navigation/MobileNav';
import { useHeaderState } from '@/components/hooks/useHeaderState';

/**
 * Header
 * - Non-sticky glass surface with gradient underline and soft glow on scroll
 * - Uses DS tokens/classes only (no inline hex)
 * - DesktopNav/MobileNav receive `showAdmin={false}`
 * - Preserves mega menu & streak chip (rendered inside DesktopNav/MobileNav)
 */
export const Header: React.FC<{ streak?: number }> = ({ streak }) => {
  const [openDesktopModules, setOpenDesktopModules] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileModulesOpen, setMobileModulesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Canonical source of truth for auth/role/streak/signOut
  const { user, role, streak: streakState, ready, signOut } = useHeaderState(streak);

  // Solidify header when scrolled or any menu is open
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const solidHeader = scrolled || openDesktopModules || mobileOpen;

  // Refs & global handlers (click-outside / escape to close)
  const modulesRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (modulesRef.current && !modulesRef.current.contains(t)) {
        setOpenDesktopModules(false);
      }
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
    <SkipLink />
<header
      role="banner"
      className={[
        'relative z-50 transition-all duration-300',
        solidHeader ? 'bg-background/95 border-b border-border shadow-sm' : 'header-glass',
        'before:content-[""] before:absolute before:inset-x-0 before:bottom-0 before:h-[2px]',
        'before:bg-gradient-to-r before:from-vibrantPurple/70 before:via-electricBlue/70 before:to-neonGreen/70',
        solidHeader ? 'shadow-glow' : '',
      ].join(' ')}
    >
      <Container>
        <div className="relative flex items-center justify-between py-3 md:py-4">
          {/* Brand */}
          <Link
            href={user?.id ? '/dashboard' : '/'}
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-ds"
            aria-label="Go to home"
          >
            <span className="relative inline-flex items-center justify-center rounded-xl bg-card p-1.5 shadow-sm ring-1 ring-border">
              <Image
                src="/brand/logo.png"
                alt="GramorX logo"
                width={44}
                height={44}
                className="h-10 w-10 md:h-11 md:w-11 rounded-lg object-contain"
                priority
              />
              <span className="absolute -right-1 -bottom-1 h-2.5 w-2.5 rounded-full bg-accent/90 ring-2 ring-card" />
            </span>
            <p className="font-slab font-bold text-2xl md:text-3xl leading-none" role="heading" aria-level={1}>
              <span className="text-gradient-primary transition-opacity group-hover:opacity-90">
                GramorX
              </span>
            </p>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav
            user={user}
            role={role}
            ready={ready}
            streak={streakState}
            openModules={openDesktopModules}
            setOpenModules={setOpenDesktopModules}
            modulesRef={modulesRef}
            signOut={signOut}
            showAdmin={false}
            className="hidden lg:flex items-center gap-2 will-change-transform transition-[opacity,transform] duration-200 data-[solid=true]:opacity-100 data-[solid=false]:opacity-95"
            data-solid={solidHeader}
          />

          {/* Mobile Navigation */}
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
            showAdmin={false}
            className="lg:hidden"
          />
        </div>
      </Container>

      <span className="sr-only" aria-live="polite">
        {typeof streakState === 'number' ? `Current streak ${streakState} days` : ''}
      </span>
    </header>
  );
};
