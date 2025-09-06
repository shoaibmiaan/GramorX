// components/layouts/AuthLayout.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Container } from '@/components/design-system/Container';
import { ThemeToggle } from '@/components/design-system/ThemeToggle';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  rightIllustration?: React.ReactNode;
  showRightOnMobile?: boolean;
};

const DefaultRight = () => (
  <div className="relative h-full w-full grid place-items-center bg-primary/10 dark:bg-darker">
    <Image
      src="/brand/logo.png"
      alt="GramorX Logo"
      width={180}
      height={180}
      className="h-24 w-24 md:h-32 md:w-32 object-contain"
      priority
    />
  </div>
);

export default function AuthLayout({
  title,
  subtitle,
  children,
  right,
  rightIllustration,
  showRightOnMobile = false,
}: Props) {
  const rightContent = right ?? rightIllustration ?? <DefaultRight />;

  // Mobile-only segmented toggle
  const [mobileView, setMobileView] = React.useState<'left' | 'right'>('left');

  return (
    <div className="relative min-h-[100dvh] bg-lightBg text-lightText dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90 dark:text-foreground">
      {/* Theme toggle */}
      <div className="absolute right-2 top-2 sm:right-4 sm:top-4 z-40">
        <ThemeToggle />
      </div>

      {/* Brand underline bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-vibrantPurple via-electricBlue to-neonGreen opacity-80" aria-hidden="true" />

      {/* Mobile segmented control */}
      {showRightOnMobile && (
        <div className="md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="mx-auto w-full max-w-lg px-4 py-2">
            <div role="tablist" aria-label="Auth panels" className="grid grid-cols-2 rounded-xl border border-border bg-card">
              <button
                role="tab"
                aria-selected={mobileView === 'left'}
                className={`px-3 py-2 text-sm font-medium rounded-xl transition ${mobileView === 'left' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'}`}
                onClick={() => setMobileView('left')}
              >
                Sign in
              </button>
              <button
                role="tab"
                aria-selected={mobileView === 'right'}
                className={`px-3 py-2 text-sm font-medium rounded-xl transition ${mobileView === 'right' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'}`}
                onClick={() => setMobileView('right')}
              >
                About
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split grid */}
      <div className="mx-auto grid min-h-[calc(100dvh-2px)] w-full md:max-w-[1200px] md:grid-cols-2">
        {/* LEFT / form */}
        {(mobileView === 'left' || !showRightOnMobile) && (
          <section className="order-1 flex w-full items-center px-6 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
            <div className="w-full">
              <div className="mb-6 flex items-center justify-between sm:mb-8">
                <span className="font-slab text-h3 sm:text-h2 md:text-display text-gradient-primary">GramorX</span>
                <span className="text-xs sm:text-small text-grayish dark:text-gray-400">IELTS Portal</span>
              </div>

              <Container className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                <h1 className="font-slab text-h3 sm:text-h2 lg:text-display text-gradient-primary">{title}</h1>
                {subtitle && <p className="mt-1 text-sm sm:text-base text-grayish dark:text-gray-400">{subtitle}</p>}
                <div className="mt-4 sm:mt-6">{children}</div>
              </Container>
            </div>
          </section>
        )}

        {/* RIGHT / desktop: always visible; mobile: hidden */}
        <aside
          className="
            order-2 relative hidden md:block
            border-l border-border
            bg-card text-card-foreground dark:bg-darker
          "
        >
          <div className="sticky top-0 h-[100dvh] overflow-hidden">{rightContent}</div>
        </aside>

        {/* RIGHT / mobile sheet: visible only when toggled */}
        {showRightOnMobile && mobileView === 'right' && (
          <aside className="order-2 block md:hidden border-t border-border bg-card dark:bg-darker">
            {rightContent}
          </aside>
        )}
      </div>
    </div>
  );
}
