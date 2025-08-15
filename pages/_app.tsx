// pages/_app.tsx
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import '@/styles/globals.css';
import { Layout } from '@/components/Layout';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { isPublicRoute, isGuestOnlyRoute, canAccess, requiredRolesFor, type AppRole } from '@/lib/routeAccess';
import { ToastProvider } from '@/components/design-system/Toast';

function GuardSkeleton() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" />
    </div>
  );
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Hide chrome on auth pages (matches your design)
  const hideChrome = router.pathname === '/signup' || router.pathname.startsWith('/login');

  // Determine if current route is protected
  const guarded = useMemo(() => !isPublicRoute(router.pathname), [router.pathname]);

  const [ready, setReady] = useState<boolean>(!guarded); // public pages render immediately
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!guarded) {
        setReady(true);
        return;
      }

      setReady(false);

      // Session check
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const session = sessionData?.session;

      if (cancelled) return;

      // Not logged in → send to /login with ?next=…
      if (!session) {
        const next = encodeURIComponent(router.asPath);
        router.replace(`/login?next=${next}`);
        return;
      }

      // Logged in → prevent visiting guest-only (login/signup)
      if (isGuestOnlyRoute(router.pathname)) {
        router.replace('/dashboard');
        return;
      }

      // Fetch current user's role (from public.profiles)
      const { data: profile, error } = await supabaseBrowser
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (cancelled) return;

      if (error) {
        // If role fetch fails, still let the page render for non-role-guarded routes
        console.warn('profiles role fetch error', error.message);
      }

      const currentRole = (profile?.role ?? null) as AppRole | null;
      setRole(currentRole);

      // Role-based route gating (e.g., /admin, /teacher)
      const needs = requiredRolesFor(router.pathname);
      if (needs && !canAccess(router.pathname, currentRole)) {
        router.replace(`/403?next=${encodeURIComponent(router.asPath)}`);
        return;
      }

      setReady(true);
    };

    check();

    // Re-check on auth changes (login/logout)
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [guarded, router.pathname, router.asPath]);

  const page = ready ? <Component {...pageProps} /> : <GuardSkeleton />;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ToastProvider>
        {hideChrome ? page : <Layout>{page}</Layout>}
      </ToastProvider>
    </ThemeProvider>
  );
}
