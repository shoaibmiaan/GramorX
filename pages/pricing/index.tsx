// pages/pricing/index.tsx
import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import PlanPicker, { type Plan, type PlanPickerProps } from '@/components/payments/PlanPicker';
import SocialProofStrip from '@/components/marketing/SocialProofStrip';

type PlanKey = 'starter' | 'booster' | 'master';
type Cycle = 'monthly' | 'annual';

const PLANS: Plan[] = [
  {
    key: 'starter',
    title: 'Seedling',
    subtitle: 'Essentials to get started',
    priceMonthly: 999,
    priceAnnual: 899,
    features: ['Daily vocab', '1 grammar drill/week', 'Community access'],
  },
  {
    key: 'booster',
    title: 'Rocket',
    subtitle: 'Best for fast progress',
    priceMonthly: 1999,
    priceAnnual: 1699,
    features: ['All IELTS modules', 'AI feedback', 'Mock tests', 'Progress analytics'],
    badge: 'Most popular',
    mostPopular: true,
  },
  {
    key: 'master',
    title: 'Owl',
    subtitle: 'Advanced & coaching',
    priceMonthly: 3999,
    priceAnnual: 3499,
    features: ['Priority support', '1:1 reviews', 'Advanced drills'],
  },
];

const PricingPage: NextPage = () => {
  const router = useRouter();
  const referralCode = router.query.code ? String(router.query.code) : undefined;

  const handleSelect: NonNullable<PlanPickerProps['onSelect']> = (plan, cycle) => {
    const qs = new URLSearchParams();
    qs.set('plan', plan);
    qs.set('billingCycle', cycle as Cycle);
    if (referralCode) qs.set('code', referralCode);
    router.push(`/checkout?${qs.toString()}`);
  };

  return (
    <>
      <Head><title>Pricing — GramorX</title></Head>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <header className="text-center">
            <h1 className="text-4xl font-semibold">Choose your plan</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Upgrade for full IELTS modules, AI evaluation, and performance analytics.
            </p>
          </header>

          <SocialProofStrip className="mx-auto mt-8" />

          <section className="mt-8">
            <PlanPicker plans={PLANS} onSelect={handleSelect} defaultCycle="monthly" />
          </section>

          <section className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <h3 className="text-lg font-medium">All plans include</h3>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
                <li>Dark/Light UI • Mobile friendly</li>
                <li>Study calendar & streaks</li>
                <li>Core IELTS practice sets</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border p-4">
              <h3 className="text-lg font-medium">Need a discount?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Have a referral code? You can apply it at checkout.
              </p>
              <Link
                href={referralCode ? `/checkout?plan=booster&billingCycle=monthly&code=${encodeURIComponent(referralCode)}` : '/checkout?plan=booster&billingCycle=monthly'}
                className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                Continue to checkout
              </Link>
              <p className="mt-2 text-xs text-muted-foreground">
                Or <Link href="/account/referrals" className="underline underline-offset-4">generate your own code</Link>.
              </p>
            </div>

            <div className="rounded-xl border border-border p-4">
              <h3 className="text-lg font-medium">Questions?</h3>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="underline-offset-4 hover:underline">Billing & refunds</Link>
                </li>
                <li>
                  <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy & data</Link>
                </li>
                <li>
                  <Link href="/contact" className="underline-offset-4 hover:underline">Contact support</Link>
                </li>
              </ul>
            </div>
          </section>

          <footer className="mt-10 text-center text-sm text-muted-foreground">
            Prices shown are indicative; taxes may apply at checkout.
          </footer>
        </div>
      </main>
    </>
  );
};

export default PricingPage;
