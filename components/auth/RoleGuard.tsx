import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Role = 'admin' | 'teacher' | 'student';
type Props = { allow: Role | Role[]; children: React.ReactNode };

const asSet = (a: Role | Role[]) => new Set(Array.isArray(a) ? a : [a]);

export function RoleGuard({ allow, children }: Props) {
  const router = useRouter();
  const allowed = asSet(allow);
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const getRole = async (): Promise<Role | null> => {
      const { data } = await supabaseBrowser.auth.getSession();
      const user = data.session?.user ?? null;

      if (!user) return null;

      let role: any =
        (user.app_metadata as any)?.role ??
        (user.user_metadata as any)?.role ??
        null;

      if (!role && user.id) {
        const { data: prof } = await supabaseBrowser
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        role = prof?.role ?? null;
      }
      return role ? String(role).toLowerCase() as Role : null;
    };

    (async () => {
      const r = await getRole();

      // Admin can access everything. Teachers can access teacher pages.
      const pass =
        r === 'admin' ||
        (r && allowed.has(r as Role));

      if (!cancelled) {
        if (pass) setOk(true);
        else {
          setOk(false);
          router.replace(`/403?next=${encodeURIComponent(router.asPath)}`);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [router, allowed]);

  if (ok === null) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse h-6 w-40 rounded bg-gray-200 dark:bg-white/10" />
      </div>
    );
  }
  if (!ok) return null;
  return <>{children}</>;
}
