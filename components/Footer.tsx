'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { NavLink } from '@/components/design-system/NavLink';
import { SocialIconLink } from '@/components/design-system/SocialIconLink';
import { MailIcon, PhoneIcon, MapPinIcon } from '@/components/design-system/icons';

const year = new Date().getFullYear();

const MODULES = [
  { label: 'Listening', href: '/listening' },
  { label: 'Reading', href: '/reading' },
  { label: 'Writing', href: '/writing' },
  { label: 'Speaking', href: '/speaking' },
] as const;

const QUICK_LINKS = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Band Predictor', href: '/predictor' },
  { label: 'Learning', href: '/learning' },
  { label: 'Mock Tests', href: '/mock-tests' },
] as const;

const RESOURCES = [
  { label: 'Help Center', href: '/help' },
  { label: 'Community', href: '/community' },
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Privacy', href: '/legal/privacy' },
] as const;

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-16 border-t border-border bg-background">
      {/* Brand gradient bar */}
      <div
        className="
          h-1 w-full bg-gradient-to-r
          from-vibrantPurple via-electricBlue to-neonGreen
          opacity-80
        "
        aria-hidden="true"
      />
      <Container>
        {/* Top CTA */}
        <div className="flex flex-col items-start justify-between gap-4 py-10 sm:flex-row sm:items-center">
          <h2 className="font-slab text-2xl">
            Ready to boost your IELTS score?
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="
                inline-flex items-center justify-center rounded-full
                bg-primary px-5 py-2.5 font-semibold text-primary-foreground
                transition hover:opacity-90
              "
            >
              Get started
            </Link>
            <Link
              href="/pricing"
              className="
                inline-flex items-center justify-center rounded-full
                border border-border px-5 py-2.5 font-semibold
                hover:bg-muted
              "
            >
              See pricing
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-10 border-t border-border py-12 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="font-slab text-xl font-bold">
                  <span className="text-gradient-primary">GramorX</span>
                </span>
              </Link>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              AI-powered IELTS prep: focused practice, instant feedback, and
              clear analytics—built to help you score higher, faster.
            </p>

            {/* Socials */}
            <div className="mt-5 flex items-center gap-3">
              <SocialIconLink platform="x" href="https://x.com/gramorx" />
              <SocialIconLink platform="facebook" href="https://facebook.com/gramorx" />
              <SocialIconLink platform="instagram" href="https://instagram.com/gramorx" />
              <SocialIconLink platform="youtube" href="https://youtube.com/@gramorx" />
            </div>
          </div>

          {/* Modules */}
          <div>
            <h3 className="mb-3 font-slab text-lg">IELTS Modules</h3>
            <ul className="space-y-2">
              {MODULES.map((m) => (
                <li key={m.href}>
                  <NavLink
                    href={m.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {m.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-3 font-slab text-lg">Quick Links</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((q) => (
                <li key={q.href}>
                  <NavLink
                    href={q.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {q.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 font-slab text-lg">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPinIcon className="mt-0.5 h-4 w-4 opacity-80" aria-hidden />
                <span>Gulberg, Lahore, Pakistan</span>
              </li>
              <li className="flex items-start gap-2">
                <PhoneIcon className="mt-0.5 h-4 w-4 opacity-80" aria-hidden />
                <span>+92 300 0000000</span>
              </li>
              <li className="flex items-start gap-2">
                <MailIcon className="mt-0.5 h-4 w-4 opacity-80" aria-hidden />
                <span>support@gramorx.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-border py-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {year} GramorX Learning School. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <NavLink href="/terms" className="hover:text-foreground">
              Terms
            </NavLink>
            <NavLink href="/privacy" className="hover:text-foreground">
              Privacy
            </NavLink>
            <a
              href="#top"
              className="rounded-full border border-border px-3 py-1 hover:bg-muted"
              aria-label="Back to top"
            >
              Back to top
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
