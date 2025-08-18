// pages/premium/pin.tsx
import React from 'react';
import dynamic from 'next/dynamic';

const PinManager = dynamic(() => import('@/components/premium-ui/PinManager'), { ssr: false });

export default function PremiumPin() {
  return (
    <main className="pr-min-h-screen pr-flex pr-items-center pr-justify-center pr-bg-gradient-to-b pr-from-black pr-to-neutral-900 pr-text-white pr-px-4">
      <PinManager />
    </main>
  );
}
