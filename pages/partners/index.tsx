import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { NextPage } from 'next';
import PartnerSummary from '@/components/partners/PartnerSummary';

const PartnersHome: NextPage = () => {
  return (
    <>
      <Head><title>Partners — GramorX</title></Head>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Partner Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Track redemptions from your referral codes and see your performance.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/account/referrals" className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90">
                Generate / Share Code
              </Link>
              <Link href="/admin/partners" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                Admin view
              </Link>
            </div>
          </header>

          <PartnerSummary className="mt-4" />

          <section className="mt-8 rounded-xl border border-border p-4">
            <h2 className="text-lg font-medium">Tips to grow</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>Add your referral link in your bio (Instagram, TikTok, LinkedIn).</li>
              <li>Share short reels solving a single IELTS doubt; end with your link.</li>
              <li>Highlight the <span className="font-medium">14-day Booster</span> reward for new users.</li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
};

export default PartnersHome;
