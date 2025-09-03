// pages/checkout/index.tsx
import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import PlanPicker, { type PlanPickerProps } from '@/components/payments/PlanPicker';
import CheckoutForm from '@/components/payments/CheckoutForm';
import RedeemBox from '@/components/referrals/RedeemBox';
import SocialProofStrip from '@/components/marketing/SocialProofStrip';

type PlanKey = 'starter' | 'booster' | 'master';
type Cycle = 'monthly' | 'annual';

const PLAN_LABEL: Record<PlanKey, string> = {
  starter: 'Seedling 🌱',
  booster: 'Rocket 🚀',
  master: 'Owl 👑',
};

const CheckoutPage: NextPage = () => {
  const router = useRouter();
  const planParam = String(router.query.plan ?? '');
  const codeParam = router.query.code ? String(router.query.code) : undefined;
  const cycleParam = (String(router.query.billingCycle ?? 'monthly') as Cycle);

  const hasPlan = (['starter', 'booster', 'master'] as PlanKey[]).includes(planParam as PlanKey);
  const plan = (hasPlan ? (planParam as PlanKey) : undefined);

  const handleSelect: NonNullable<PlanPickerProps['onSelect']> = (p, c) => {
    const qs = new URLSearchParams();
    qs.set('plan', p);
    qs.set('billingCycle', c);
    if (codeParam) qs.set('code', codeParam);
    router.push(`/checkout?${qs.toString()}`);
  };

  return (
    <>
      <Head><title>Checkout — GramorX</title></Head>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">{plan ? 'Checkout' : 'Choose your plan'}</h1>
              {plan ? (
                <p className="text-sm text-muted-foreground">
                  Plan selected: <span className="font-medium">{PLAN_LABEL[plan]}</span>
                  {codeParam ? <> · Referral code: <span className="font-mono">{codeParam}</span></> : null}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Pick a plan, then complete payment below.</p>
              )}
            </div>
            <Link href="/pricing" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
              Back to pricing
            </Link>
          </div>

          {!plan ? (
            <>
              <PlanPicker onSelect={handleSelect} defaultCycle={cycleParam} className="mt-2" />
              <SocialProofStrip className="mt-8" />
            </>
          ) : (
            <>
              <section className="rounded-xl border border-border p-4">
                <h2 className="mb-1 text-lg font-medium">Payment methods</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Complete payment to unlock full IELTS modules, AI feedback, and analytics.
                </p>
                <CheckoutForm
                  plan={plan}
                  billingCycle={cycleParam}
                  referralCode={codeParam}
                  className="mt-2"
                />
              </section>

              <RedeemBox className="mt-6" />

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Link href="/account/referrals" className="underline-offset-4 hover:underline">
                  Don’t have a code? Generate yours
                </Link>
                <span>•</span>
                <Link href="/partners" className="underline-offset-4 hover:underline">
                  Become a partner
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default CheckoutPage;
