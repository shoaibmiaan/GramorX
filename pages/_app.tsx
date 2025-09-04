// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';
import '@/styles/themes/index.css';

import { Layout } from '@/components/Layout';
import { ToastProvider } from '@/components/design-system/Toaster';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { env } from '@/lib/env';
import { LanguageProvider } from '@/lib/localeProvider';
import { initIdleTimeout } from '@/utils/idleTimeout';
import { isGuestOnlyRoute, isPublicRoute } from '@/lib/routeAccess';
import useRouteGuard from '@/hooks/useRouteGuard';

import { PremiumThemeProvider } from '@/premium-ui/theme/PremiumThemeProvider';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';
import SidebarAI from '@/components/ai/SidebarAI';
import AuthAssistant from '@/components/auth/AuthAssistant';

import { Poppins, Roboto_Slab } from 'next/font/google';
const poppins = Poppins({ subsets: ['latin'], weight: ['400','500','600','700'], display: 'swap', variable: '--font-sans' });
const slab = Roboto_Slab({ subsets: ['latin'], weight: ['400','600','700'], display: 'swap', variable: '--font-display' });

function GuardSkeleton() {
  return (
    <div className="min-h-[100dvh] grid place-items-center">
      <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" />
    </div>
  );
}

function InnerApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pathname = router.pathname;

  const isPremium = pathname.startsWith('/premium');
  const isAuthPage = useMemo(
    () =>
      /^\/(login|signup|register)(\/|$)/.test(pathname) ||
      /^\/auth\/(login|signup|register)(\/|$)/.test(pathname),
    [pathname]
  );
  const isNoChromeRoute = useMemo(
    () => /\/exam(\/|$)|\/exam-room(\/|$)|\/focus-mode(\/|$)/.test(pathname),
    [pathname]
  );
  const showLayout = !isPremium && !isAuthPage && !isNoChromeRoute;

  useEffect(() => {
    const cleanup = initIdleTimeout(env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES);
    return cleanup;
  }, []);

  // Sync client session → HttpOnly cookies for SSR/middleware
  useEffect(() => {
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange(async (event, session) => {
      try {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        });
      } catch {}
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const { isChecking } = useRouteGuard();

  // Background token expiry safety — don't force-login on /pricing
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const expiresAt = session?.expires_at;
      if (session && expiresAt && expiresAt <= Date.now() / 1000) {
        await supabaseBrowser.auth.signOut();
        if (!isGuestOnlyRoute(router.pathname) && !isPublicRoute(router.pathname) && !/^\/pricing(\/|$)/.test(router.pathname)) {
          router.replace('/login');
        }
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  if (isChecking) return <GuardSkeleton />;

  const pageBody = isPremium ? (
    <PremiumThemeProvider>
      <Component {...pageProps} />
    </PremiumThemeProvider>
  ) : (
    <Component {...pageProps} />
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Head>
        <link rel="preload" as="style" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          media="print"
          onLoad={(e) => { (e.currentTarget as HTMLLinkElement).media = 'all'; }}
        />
        <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" /></noscript>
        {isPremium ? <link rel="stylesheet" href="/premium.css" /> : null}
      </Head>

      <div className={`${poppins.variable} ${slab.variable} ${poppins.className} min-h-[100dvh]`}>
        {showLayout ? (
          <Layout>
            <ImpersonationBanner />
            {pageBody}
          </Layout>
        ) : (
          <>
            <ImpersonationBanner />
            {pageBody}
          </>
        )}
        <AuthAssistant />
        <SidebarAI />
      </div>
    </ThemeProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <LanguageProvider>
      <ToastProvider>
        <NotificationProvider>
          <InnerApp {...props} />
        </NotificationProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
