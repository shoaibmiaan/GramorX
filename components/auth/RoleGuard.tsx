// components/auth/RoleGuard.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

// value import
import { getCurrentRole } from "@/lib/roles";
// type-only import (note: AppRole is your role union)
import type { AppRole } from "@/lib/roles";

type Props = { allow: AppRole | AppRole[]; children: React.ReactNode };

const asSet = (a: AppRole | AppRole[]) => new Set(Array.isArray(a) ? a : [a]);

const RoleGuard: React.FC<Props> = ({ allow, children }) => {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const r = await getCurrentRole(); // AppRole | null
        const allowed = asSet(allow);

        if (r && allowed.has(r)) {
          setOk(true);
        } else {
          setOk(false);
          router.replace("/login"); // or /403
        }
      } catch {
        setOk(false);
        router.replace("/login");
      }
    };
    run();
  }, [allow, router]);

  if (!ok) return null;
  return <>{children}</>;
};

export default RoleGuard;
export { RoleGuard };
