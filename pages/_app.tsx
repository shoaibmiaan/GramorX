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
import {
  isPublicRoute,
  isGuestOnlyRoute,
  canAccess,
  requiredRolesFor,
  getUserRole,
  type AppRole,
} from '@/lib/routeAccess';

// Premium theme wrapper (kept for /premium paths)
import { PremiumThemeProvider } from '@/premium-ui/theme/PremiumThemeProvider';

// ⬇️ Impersonation banner
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

// ⬇️ Global Sidebar AI (Leo-style)
import { SidebarAI } from '@/components/ai/SidebarAI';

// ✅ Fonts via next/font (non-blocking)
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
    <div className="min-h-screen grid place-items-center">
      <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" />
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
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

  // --- Route guards (role-aware) ---
  const [isChecking, setIsChecking] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const {
          data: { session },
        } = await supabaseBrowser.auth.getSession();
        const user = session?.user ?? null;
        const r = getUserRole(user);

        if (!mounted) return;
        setIsAuthed(!!user);
        setRole(r);

        const publicR = isPublicRoute(pathname);
        const guestOnlyR = isGuestOnlyRoute(pathname);

        // If guest-only and user is logged in → send to dashboard
        if (guestOnlyR && user) {
          router.replace('/dashboard');
          return;
        }

        // If protected and user lacks role → redirect to login with info
        if (!publicR && !canAccess(pathname, r)) {
          const need = requiredRolesFor(pathname);
          router.replace({
            pathname: '/login',
            query: { next: pathname, need: Array.isArray(need) ? need.join(',') : need },
          });
          return;
        }
      } finally {
        mounted = false;
        setIsChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
    // ⬇️ Default to dark to match desired_design; class-based theming for DS tokens
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

        {/* Premium stylesheet only for /premium (existing pipeline) */}
        {isPremium ? <link rel="stylesheet" href="/premium.css" /> : null}
      </Head>

      {/* Apply fonts to the whole app; DS uses var(--font-sans)/var(--font-display) */}
      <div className={`${poppins.variable} ${slab.variable} ${poppins.className} min-h-screen`}>
        <ToastProvider>
          {showLayout ? (
            // Regular pages: show banner inside the layout, above page content
            <Layout>
              <ImpersonationBanner />
              {pageBody}
            </Layout>
          ) : (
            // No-chrome (premium, auth, or exam/focus) – still show banner
            <>
              <ImpersonationBanner />
              {pageBody}
            </>
          )}

          {/* ⬇️ Global AI Sidebar (fixed, overlays anywhere) */}
          <SidebarAI />
        </ToastProvider>
      </div>
    </ThemeProvider>
  );
}
