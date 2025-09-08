'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { NavLink } from '@/components/design-system/NavLink';
import { SocialIconLink } from '@/components/design-system/SocialIconLink';

const year = new Date().getFullYear();

export const FooterMini: React.FC<{
  showSocials?: boolean;
  className?: string;
}> = ({ showSocials = false, className = '' }) => {
  return (
    <footer className={`relative border-t border-border bg-background ${className}`}>
      {/* Slim brand bar */}
      <div
        className="h-[2px] w-full bg-gradient-to-r from-vibrantPurple via-electricBlue to-neonGreen opacity-80"
        aria-hidden="true"
      />
      <Container>
        <div className="flex flex-col items-start justify-between gap-3 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
          {/* Left: brand + year */}
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="font-slab text-base font-bold">
                <span className="text-gradient-primary">GramorX</span>
              </span>
            </Link>
            <span className="opacity-70">·</span>
            <span>© {year}</span>
          </div>

          {/* Center: quick links */}
          <nav aria-label="Mini footer navigation" className="order-last w-full sm:order-none sm:w-auto">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <li><NavLink href="/legal/terms" className="hover:text-foreground">Terms</NavLink></li>
              <li><NavLink href="/legal/privacy" className="hover:text-foreground">Privacy</NavLink></li>
              <li><NavLink href="/pricing" className="hover:text-foreground">Pricing</NavLink></li>
              <li><NavLink href="/help" className="hover:text-foreground">Help</NavLink></li>
            </ul>
          </nav>

          {/* Right: socials (optional) + back to top */}
          <div className="flex items-center gap-3">
            {showSocials && (
              <div className="flex items-center gap-2">
                <SocialIconLink platform="x" href="https://x.com/gramorx" />
                <SocialIconLink platform="facebook" href="https://facebook.com/gramorx" />
                <SocialIconLink platform="instagram" href="https://instagram.com/gramorx" />
              </div>
            )}
            <a
              href="#top"
              className="rounded-full border border-border px-3 py-1 hover:bg-muted"
              aria-label="Back to top"
            >
              Top
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default FooterMini;
