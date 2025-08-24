import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

const STAFF = new Set(['admin', 'teacher']);

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sess } = await supabaseBrowser.auth.getSession();
      const user = sess?.session?.user ?? null;

      if (!user) {
        if (!cancelled) {
          setOk(false);
          router.replace(`/403?next=${encodeURIComponent(router.asPath)}`);
        }
        return;
      }

      // 1) Read role from either app_metadata or user_metadata
      let role: string | null =
        (user.app_metadata as any)?.role ??
        (user.user_metadata as any)?.role ??
        null;
      role = role ? String(role).toLowerCase() : null;

      if (role && STAFF.has(role)) {
        if (!cancelled) setOk(true);
        return;
      }

      // 2) Fallback to DB (profiles.role)
      const { data: prof } = await supabaseBrowser
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      role = (prof?.role ? String(prof.role).toLowerCase() : null);

      if (!cancelled) {
        if (role && STAFF.has(role)) setOk(true);
        else {
          setOk(false);
          router.replace(`/403?next=${encodeURIComponent(router.asPath)}`);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  if (ok === null) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse h-6 w-32 rounded bg-gray-200 dark:bg-white/10" />
      </div>
    );
  }
  if (!ok) return null;
  return <>{children}</>;
}
