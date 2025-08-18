import React, { useEffect } from "react";
import { PremiumShell } from "@/components/premium-ui/layout/PremiumShell";
import { PinLock } from "@/components/premium-ui/composed/PinLock";
import { useRouter } from "next/router";

export default function PremiumLock() {
  const router = useRouter();
  const nextPath = typeof router.query.next === "string" ? router.query.next : "/premium";

  useEffect(() => {
    // Set an initial theme if missing (so the page looks premium)
    const root = (document.getElementById("premium-root") || document.querySelector(".premium-root")) as HTMLElement | null;
    if (root && !root.getAttribute("data-pr-theme")) root.setAttribute("data-pr-theme", "dark");
  }, []);

  return (
    <div className="pr-p-6 pr-text-text">
      <PremiumShell>
        <div className="pr-max-w-2xl pr-mx-auto pr-mt-10">
          <PinLock onSuccess={() => router.replace(nextPath)} digits={6} />
        </div>
      </PremiumShell>
    </div>
  );
}
