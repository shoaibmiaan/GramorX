import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useLocale } from '@/lib/localeProvider';
import {
  isGuestOnlyRoute,
  isPublicRoute,
  canAccess,
  requiredRolesFor,
  getUserRole,
  type AppRole,
} from '@/lib/routeAccess';

export function useRouteGuard() {
  const router = useRouter();
  const { setLocale } = useLocale();
  const pathname = router.pathname;

  // NEW: treat /pricing as public even if routeAccess hasn't been updated yet
  const isPricingRoute = useMemo(() => /^\/pricing(\/|$)/.test(pathname), [pathname]);

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    let active = true;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabaseBrowser.auth.getSession();

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
        if (
          user &&
          !user.email_confirmed_at &&
          !user.phone_confirmed_at &&
          !isPricingRoute &&
          pathname !== '/auth/verify'
        ) {
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
          const next =
            typeof nextParam === 'string'
              ? nextParam
              : Array.isArray(nextParam)
                ? nextParam[0]
                : undefined;
          router.replace(next || '/dashboard');
          return;
        }

        // Role/guard check — skip for /pricing
        if (!isPricingRoute && !canAccess(pathname, role)) {
          const need = requiredRolesFor(pathname);
          if (!role) {
            router.replace({
              pathname: '/login',
              query: {
                next: pathname,
                need: Array.isArray(need) ? need.join(',') : need,
              },
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

  return { isChecking };
}

export default useRouteGuard;

