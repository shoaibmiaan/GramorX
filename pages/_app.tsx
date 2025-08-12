import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import '@/styles/globals.css';
import { Layout } from '@/components/Layout';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { isPublicRoute, isGuestOnlyRoute } from '@/lib/routeAccess';

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
  const hideChrome =
    router.pathname === '/signup' || router.pathname.startsWith('/login');

  // Determine if current route is protected
  const guarded = useMemo(() => !isPublicRoute(router.pathname), [router.pathname]);

  const [ready, setReady] = useState<boolean>(!guarded); // public pages render immediately

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!guarded) {
        setReady(true);
        return;
      }
      setReady(false);
      const { data } = await supabaseBrowser.auth.getSession();

      if (cancelled) return;

      // Not logged in → send to /login with ?next=…
      if (!data.session) {
        const next = encodeURIComponent(router.asPath);
        router.replace(`/login?next=${next}`);
        return;
      }

      // Logged in → prevent visiting guest-only (login/signup)
      if (isGuestOnlyRoute(router.pathname)) {
        router.replace('/dashboard');
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
      {hideChrome ? page : <Layout>{page}</Layout>}
    </ThemeProvider>
  );
}
