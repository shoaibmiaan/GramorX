import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentRole, Role } from '@/lib/roles';
type Props = { allow: Role | Role[]; children: React.ReactNode };

const asSet = (a: Role | Role[]) => new Set(Array.isArray(a) ? a : [a]);

export function RoleGuard({ allow, children }: Props) {
  const router = useRouter();
  const allowed = asSet(allow);
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const r = await getCurrentRole();

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
