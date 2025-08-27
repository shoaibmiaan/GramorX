import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/design-system/Button';

export default function QuickDrillButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startDrill = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quick-drill');
      const data = await res.json();
      if (data?.skill) {
        await router.push(`/quick/${data.skill}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={startDrill} variant="secondary" className="rounded-ds-xl" loading={loading}>
      10-Minute Mode
    </Button>
  );
}
