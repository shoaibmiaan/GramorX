// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';

import { Layout } from '@/components/Layout';
import { ToastProvider } from '@/components/design-system/Toast';
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

// Premium theme wrapper (kept for /premium paths)
import { PremiumThemeProvider } from '@/premium-ui/theme/PremiumThemeProvider';

// Impersonation banner
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

// Global Sidebar AI
import { SidebarAI } from '@/components/ai/SidebarAI';

// Fonts
import { Poppins, Roboto_Slab } from 'next/font/google';
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});
const slab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

// Minimal loading shell for route guards
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

  // Premium area handling
  const isPremium = pathname.startsWith('/premium');

  // Auth pages (login/signup/register) – no header/footer
  const isAuthPage = useMemo(
    () =>
      /^\/(login|signup|register)(\/|$)/.test(pathname) ||
      /^\/auth\/(login|signup|register)(\/|$)/.test(pathname),
    [pathname]
  );

  // “No chrome” pages like exam/focus
  const isNoChromeRoute = useMemo(() => {
    return /\/exam(\/|$)|\/exam-room(\/|$)|\/focus-mode(\/|$)/.test(pathname);
  }, [pathname]);

  // Show Layout (header/footer) only if not premium, not auth page, not other no-chrome pages
  const showLayout = !isPremium && !isAuthPage && !isNoChromeRoute;

  // --- Idle timeout ---
  useEffect(() => {
    const cleanup = initIdleTimeout(env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES);
    return cleanup;
  }, []);

  // --- Route guards (role-aware) ---
  const [isChecking, setIsChecking] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabaseBrowser.auth.getSession();

        const guestOnlyR = isGuestOnlyRoute(pathname);
        const publicR = isPublicRoute(pathname);

        let currentSession = session;
        const expiresAt = session?.expires_at;
        if (session && expiresAt && expiresAt <= Date.now() / 1000) {
          await supabaseBrowser.auth.signOut();
          currentSession = null;
          if (!guestOnlyR && !publicR) {
            router.replace('/login');
            return;
          }
        }

        const user = currentSession?.user ?? null;
        const r = getUserRole(user);
        if (!active) return;

        setRole(r);

        if (user) {
          const { data: profile } = await supabaseBrowser
            .from('user_profiles')
            .select('preferred_language')
            .eq('user_id', user.id)
            .maybeSingle();
          const lang = profile?.preferred_language || 'en';
          setLocale(lang);
        }

        // If guest-only and user is logged in → send to dashboard
        if (guestOnlyR && user) {
          router.replace('/dashboard');
          return;
        }

        // If protected and user lacks role → login if unauthenticated, else 403
        if (!canAccess(pathname, r)) {
          const need = requiredRolesFor(pathname);
          if (!r) {
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
  }, [pathname]);

  // Periodically verify session expiration for long-lived pages
  useEffect(() => {
    const interval = setInterval(async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();
      const expiresAt = session?.expires_at;
      if (session && expiresAt && expiresAt <= Date.now() / 1000) {
        await supabaseBrowser.auth.signOut();
        if (
          !isGuestOnlyRoute(router.pathname) &&
          !isPublicRoute(router.pathname)
        ) {
          router.replace('/login');
        }
      }
    }, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval);
  }, [router]);

  if (isChecking) return <GuardSkeleton />;

  // Compose page body (premium wrapper on /premium)
  const pageBody = isPremium ? (
    <PremiumThemeProvider>
      <Component {...pageProps} />
    </PremiumThemeProvider>
  ) : (
    <Component {...pageProps} />
  );

  return (
    // Default to dark; class-based theming for DS tokens
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Head>
        {/* Non-blocking Font Awesome (kept for compatibility while migrating to icon components) */}
        <link
          rel="preload"
          as="style"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          media="print"
          onLoad={(e) => {
            const el = e.currentTarget as HTMLLinkElement;
            el.media = 'all';
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          />
        </noscript>

        {/* Premium stylesheet only for /premium */}
        {isPremium ? <link rel="stylesheet" href="/premium.css" /> : null}
      </Head>

      {/* Apply fonts to the whole app; DS uses var(--font-sans)/var(--font-display) */}
      <div className={`${poppins.variable} ${slab.variable} ${poppins.className} min-h-[100dvh]`}>
        <ToastProvider>
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

          {/* Global AI Sidebar */}
          <SidebarAI />
        </ToastProvider>
      </div>
    </ThemeProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <LanguageProvider>
      <InnerApp {...props} />
    </LanguageProvider>
  );
}
