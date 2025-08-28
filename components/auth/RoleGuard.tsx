// components/auth/RoleGuard.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

// Value import:
import { getCurrentRole } from "@/lib/roles";
// Type-only import:
import type { Role } from "@/lib/roles";

type Props = { allow: Role | Role[]; children: React.ReactNode };

const asSet = (a: Role | Role[]) => new Set(Array.isArray(a) ? a : [a]);

const RoleGuard: React.FC<Props> = ({ allow, children }) => {
  const router = useRouter();
  const [ok, setOk] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      try {
        const r = await getCurrentRole(); // should return a Role
        const allowed = asSet(allow);
        if (allowed.has(r)) {
          setOk(true);
        } else {
          setOk(false);
          router.replace("/login"); // or a 403 page
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
