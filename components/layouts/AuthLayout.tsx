// components/layouts/AuthLayout.tsx
import React from 'react';
import Image from 'next/image';
import { Container } from '@/components/design-system/Container';
import { ThemeToggle } from '@/components/design-system/ThemeToggle';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /**
   * Optional element rendered on the right side of the layout.
   * `rightIllustration` is kept for backwards compatibility.
   */
  right?: React.ReactNode;
  rightIllustration?: React.ReactNode;
  /**
   * Render a condensed brand panel on mobile screens. Hidden by default.
   */
  showRightOnMobile?: boolean;
};

const DefaultRight = () => (
  <div className="relative w-full h-full flex items-center justify-center bg-primary/10 dark:bg-dark">
    <Image
      src="/brand/logo.png"
      alt="GramorX Logo"
      fill
      sizes="100vw"
      className="object-contain p-6"
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
  const rightWrapperClass = showRightOnMobile
    ? 'flex h-24 sm:h-32 md:h-auto w-full md:w-1/2 lg:w-2/5 xl:w-1/3'
    : 'hidden md:flex md:w-1/2 lg:w-2/5 xl:w-1/3';
  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      {/* Left: content */}
      <div className="flex flex-col justify-center w-full md:w-1/2 lg:w-3/5 xl:w-2/3 px-6 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <span className="font-slab text-h3 sm:text-h2 md:text-display text-gradient-primary">GramorX</span>
          <span className="text-xs sm:text-small text-grayish dark:text-gray-400">IELTS Portal</span>
        </div>

        <Container className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          <h1 className="font-slab text-h3 sm:text-h2 lg:text-display text-gradient-primary">{title}</h1>
          {subtitle && <p className="mt-1 text-sm sm:text-base text-grayish">{subtitle}</p>}
          <div className="mt-4 sm:mt-6">{children}</div>
        </Container>
      </div>

      {/* Right: illustration */}
      <div className={rightWrapperClass}>{rightContent}</div>

      {/* Theme toggle */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
