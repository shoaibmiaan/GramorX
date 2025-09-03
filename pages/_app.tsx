// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';
import '@/styles/themes/index.css';

import { Layout } from '@/components/Layout';
import { ToastProvider } from '@/components/design-system/Toaster';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { env } from '@/lib/env';
import { LanguageProvider, useLocale } from '@/lib/locale';
import { initIdleTimeout } from '@/utils/idleTimeout';
import {
  isGuestOnlyRoute,
  isPublicRoute,
  canAccess,
  requiredRolesFor,
  getUserRole,
  type AppRole,
} from '@/lib/routeAccess';

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
  const { setLocale } = useLocale();
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

  // NEW: treat /pricing as public even if routeAccess hasn't been updated yet
  const isPricingRoute = useMemo(() => /^\/pricing(\/|$)/.test(pathname), [pathname]);

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

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    let active = true;

    (async () => {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();

        const guestOnlyR = isGuestOnlyRoute(pathname);
        const publicR = isPublicRoute(pathname) || isPricingRoute; // NEW: pricing forced public

        // Expired session → sign out, but don't block /pricing
        const expiresAt = session?.expires_at;
        if (session && expiresAt && expiresAt <= Date.now() / 1000) {
          await supabaseBrowser.auth.signOut();
          if (!guestOnlyR && !publicR) {
            router.replace('/login');
            return;
          }
        }

        const user = session?.user ?? null;
        const role: AppRole | null = getUserRole(user);
        if (!active) return;

        // If unverified, previously forced /auth/verify; allow /pricing to remain open
        if (user && !user.email_confirmed_at && !user.phone_confirmed_at && !isPricingRoute && pathname !== '/auth/verify') {
          await supabaseBrowser.auth.signOut();
          router.replace('/auth/verify');
          return;
        }

        if (user) {
          const { data: profile } = await supabaseBrowser
            .from('user_profiles')
            .select('preferred_language')
            .eq('user_id', user.id)
            .maybeSingle();
          const lang = profile?.preferred_language || 'en';
          setLocale(lang);
        }

        if (guestOnlyR && user) {
          const nextParam = router.query.next;
          const next = typeof nextParam === 'string' ? nextParam : Array.isArray(nextParam) ? nextParam[0] : undefined;
          router.replace(next || '/dashboard');
          return;
        }

        // Role/guard check — skip for /pricing
        if (!isPricingRoute && !canAccess(pathname, role)) {
          const need = requiredRolesFor(pathname);
          if (!role) {
            router.replace({
              pathname: '/login',
              query: { next: pathname, need: Array.isArray(need) ? need.join(',') : need },
            });
          } else {
            router.replace('/403');
          }
          return;
        }
      } finally {
        if (active) setIsChecking(false);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router.isReady, isPricingRoute]);

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
