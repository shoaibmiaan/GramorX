// components/Layout.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import FooterMini from '@/components/navigation/FooterMini';
import dynamic from 'next/dynamic';

// Load BottomNav only on client (mobile)
const BottomNav = dynamic(() => import('@/components/navigation/BottomNav'), { ssr: false });

type Props = { children: React.ReactNode };

const MINI_ROUTE_PATTERNS = [
  /^\/(login|signup|verify|reset|onboarding)/,
  /^\/(dashboard|account|speaking|listening|reading|writing|ai|partners|admin)(\/|$)/,
];

const HIDE_BOTTOM_NAV_PATTERNS = [
  /^\/(login|signup|verify|reset|admin)(\/|$)/,
];

const matches = (patterns: RegExp[], path: string) => patterns.some((re) => re.test(path));

export default function Layout({ children }: Props) {
  const { pathname } = useRouter();
  const useMiniFooter = matches(MINI_ROUTE_PATTERNS, pathname);
  const showBottomNav = !matches(HIDE_BOTTOM_NAV_PATTERNS, pathname);

  return (
    <>
      <a id="top" aria-hidden="true" />
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      {useMiniFooter ? <FooterMini /> : <Footer />}
      {showBottomNav && <BottomNav />}
    </>
  );
}
