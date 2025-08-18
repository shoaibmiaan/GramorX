// components/premium-ui/PremiumLayout.tsx
import Head from 'next/head';
import React from 'react';

type Props = { children: React.ReactNode; noFooter?: boolean };

export default function PremiumLayout({ children }: Props) {
  return (
    <>
      {/* Load your premium-only stylesheet from /public if you have one */}
      <Head>
        {/* Keep this as a static file in /public if you want isolation, or remove if you use Tailwind with pr- prefix */}
        <link rel="stylesheet" href="/premium.css" />
      </Head>

      {/* Isolated root — all premium UI uses pr-* classes, so no bleed */}
      <div id="premium-root" className="premium-root" data-pr-theme="light">
        {children}
      </div>
    </>
  );
}
