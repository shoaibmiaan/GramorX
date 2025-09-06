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
      <Head>
        <title>Checkout — GramorX</title>
      </Head>

      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 pt-6 md:pt-8 pb-10">
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">
                {plan ? 'Checkout' : 'Choose your plan'}
              </h1>

              {plan ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Plan selected: <span className="font-medium">{PLAN_LABEL[plan]}</span>
                  {codeParam ? (
                    <>
                      {' '}
                      · Referral code: <span className="font-mono">{codeParam}</span>
                    </>
                  ) : null}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Pick a plan, then complete payment below.</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/pricing"
                className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition"
              >
                Back to pricing
              </Link>
            </div>
          </div>

          {!plan ? (
            <>
              <div className="bg-card/60 border border-border rounded-2xl p-4 md:p-6 shadow-sm">
                <PlanPicker onSelect={handleSelect} defaultCycle={cycleParam} className="mt-0" />
              </div>

              <div className="mt-6">
                <SocialProofStrip />
              </div>
            </>
          ) : (
            <>
              <section className="rounded-2xl border border-border p-4 md:p-6 bg-card shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                  <div className="flex-1">
                    <h2 className="mb-1 text-lg font-medium">Payment methods</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Complete payment to unlock full IELTS modules, AI feedback, and analytics.
                    </p>

                    <div>
                      <CheckoutForm
                        plan={plan}
                        billingCycle={cycleParam}
                        referralCode={codeParam}
                        className=""
                      />
                    </div>
                  </div>

                  <aside className="mt-4 md:mt-0 w-full md:w-80">
                    <div className="rounded-xl border border-border p-4 bg-card">
                      <h3 className="text-sm font-semibold mb-2">Order summary</h3>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Plan</span>
                          <span className="font-medium">{PLAN_LABEL[plan]}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span>Billing cycle</span>
                          <span className="font-medium">{cycleParam}</span>
                        </div>
                        {codeParam && (
                          <div className="flex justify-between mt-2">
                            <span>Referral</span>
                            <span className="font-mono">{codeParam}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </aside>
                </div>
              </section>

              <div className="mt-6">
                <RedeemBox />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
