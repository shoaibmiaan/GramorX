// components/layouts/AuthLayout.tsx
'use client';

import React from 'react';
import Image from 'next/image';
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
  <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-purpleVibe/20 via-electricBlue/10 to-neonGreen/10 dark:from-dark/70 dark:to-darker/80">
    <Image
      src="/brand/logo.png"
      alt="GramorX Logo"
      width={120}
      height={120}
      className="h-24 w-24 md:h-32 md:w-32 object-contain drop-shadow-lg"
      priority
    />
    <h2 className="mt-6 text-xl font-semibold text-gray-600 dark:text-gray-300">Your IELTS Companion</h2>
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
    <div className="relative min-h-screen bg-lightBg text-lightText dark:bg-gradient-to-br dark:from-dark/90 dark:to-darker">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-40">
        <ThemeToggle />
      </div>

      {/* Grid wrapper */}
      <div className="mx-auto grid min-h-screen w-full md:max-w-[1200px] md:grid-cols-2 shadow-xl rounded-2xl overflow-hidden">
        
        {/* LEFT (form) */}
        {(mobileView === 'left' || !showRightOnMobile) && (
          <section className="flex items-center justify-center bg-white dark:bg-dark px-8 py-12">
            <div className="w-full max-w-md space-y-6">
              {/* Brand header */}
              <div className="flex items-center gap-3 mb-6">
                <Image src="/brand/logo.png" alt="GramorX" width={40} height={40} priority />
                <span className="font-slab text-2xl font-bold text-gradient-primary">GramorX</span>
              </div>

              <div>
                <h1 className="font-slab text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">{title}</h1>
                {subtitle && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
              </div>

              <div>{children}</div>
            </div>
          </section>
        )}

        {/* RIGHT (info/illustration) */}
        <aside className="hidden md:flex items-center justify-center bg-card dark:bg-darker">
          <div className="h-full w-full">{rightContent}</div>
        </aside>

        {/* Mobile toggle for right panel */}
        {showRightOnMobile && mobileView === 'right' && (
          <aside className="block md:hidden border-t border-border bg-card dark:bg-darker">
            {rightContent}
          </aside>
        )}
      </div>
    </div>
  );
}
