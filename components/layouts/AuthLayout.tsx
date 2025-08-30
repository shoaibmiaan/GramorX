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
   * Show the right panel on mobile view. Hidden by default.
   */
  showRightOnMobile?: boolean;
};

const DefaultRight = () => (
  <div className="relative w-full h-full flex items-center justify-center bg-primary/10 dark:bg-dark">
    <Image src="/brand/logo.png" alt="GramorX Logo" width={420} height={420} className="object-contain" />
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
    ? 'flex w-full md:w-1/2'
    : 'hidden md:flex w-1/2';
  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      {/* Left: content */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-6 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <span className="font-slab text-h3 sm:text-h2 md:text-display text-gradient-primary">GramorX</span>
          <span className="text-xs sm:text-small text-grayish dark:text-gray-400">IELTS Portal</span>
        </div>

        <Container className="w-full max-w-sm sm:max-w-md md:max-w-lg">
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
