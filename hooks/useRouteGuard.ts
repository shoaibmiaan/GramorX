'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useLocale } from '@/lib/locale';
import {
  isGuestOnlyRoute,
  isPublicRoute,
  canAccess,
  requiredRolesFor,
  getUserRole,
  type AppRole,
} from '@/lib/routeAccess';

function safeNext(next?: string | string[] | null) {
  const n = typeof next === 'string' ? next : Array.isArray(next) ? next[0] : '';
  if (!n) return '';
  if (n.startsWith('http')) return '';      // block open redirects
  if (n === '/login') return '';            // avoid loops
  return n;
}

export function useRouteGuard() {
  const router = useRouter();
  const { setLocale } = useLocale();
  const pathname = router.pathname;

  // Keep /pricing public even if routeAccess hasn’t been updated elsewhere
  const isPricingRoute = useMemo(() => /^\/pricing(\/|$)/.test(pathname), [pathname]);

  const [isChecking, setIsChecking] = useState(true);
  const hasRedirected = useRef(false); // prevent double redirects in StrictMode/dev

  useEffect(() => {
    if (!router.isReady) return;
    let mounted = true;

    (async () => {
      try {
        const { data: { session }, error } = await supabaseBrowser.auth.getSession();
        if (!mounted) return;

        const authed = !!session && !error;
        const user = session?.user ?? null;
        const role: AppRole | null = getUserRole(user);

        // Public routes never redirect (but we can still hydrate locale)
        const publicR = isPublicRoute(pathname) || isPricingRoute;
        const guestOnlyR = isGuestOnlyRoute(pathname);

        // hydrate locale if logged in
        if (authed && user) {
          const { data: profile } = await supabaseBrowser
            .from('user_profiles') // keep your table name
            .select('preferred_language')
            .eq('user_id', user.id)
            .maybeSingle();
          const lang = profile?.preferred_language || 'en';
          setLocale(lang);
        }

        // Prevent duplicate redirects
        if (hasRedirected.current) return;

        // Guest-only routes (e.g., /login, /signup): if authed, go away
        if (guestOnlyR) {
          if (authed) {
            hasRedirected.current = true;
            const target = safeNext(router.query.next) || '/welcome';
            await router.replace(target);
          }
          return;
        }

        // Public routes (e.g., /, /pricing, /community)
        if (publicR) {
          return;
        }

        // Protected routes begin here
        if (!authed) {
          hasRedirected.current = true;
          const next = encodeURIComponent(router.asPath);
          await router.replace(`/login?next=${next}`);
          return;
        }

        // Role-guarded routes
        if (!canAccess(pathname, role)) {
          const need = requiredRolesFor(pathname);
          hasRedirected.current = true;
          if (!role) {
            await router.replace({
              pathname: '/login',
              query: {
                next: router.asPath,
                need: Array.isArray(need) ? need.join(',') : need ?? '',
              },
            } as any);
          } else {
            await router.replace('/403');
          }
          return;
        }
      } finally {
        if (mounted) setIsChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router.isReady, router.pathname, router.asPath, pathname, setLocale, isPricingRoute]);

  return { isChecking };
}

export default useRouteGuard;
