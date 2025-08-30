// pages/pricing.tsx
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Pricing as PricingSection } from '@/components/sections/Pricing';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function PricingPage() {
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      const user = data.session?.user;
      const t = (user?.user_metadata as any)?.tier || (user?.app_metadata as any)?.tier || null;
      setTier(t ? String(t).toLowerCase() : null);
    })();
  }, []);

  return <PricingSection currentTier={tier} />;
}
