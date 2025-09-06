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
import { Badge } from '@/components/design-system/Badge';
import { Ribbon } from '@/components/design-system/Ribbon';

type PlanKey = 'starter' | 'booster' | 'master';
type Cycle = 'monthly' | 'annual';

const PLAN_LABEL: Record<PlanKey, string> = {
  starter: 'Seedling 🌱',
  booster: 'Rocket 🚀',
  master: 'Owl 👑',
};

type PlanRow = {
  key: PlanKey;
  title: string;
  priceMonthly: number; // cents (per-month)
  priceAnnual: number; // cents (per-month, billed annually)
  icon: string;
  mostPopular?: boolean;
  badge?: string;
};

const PLANS: Record<PlanKey, PlanRow> = {
  starter: {
    key: 'starter',
    title: 'Seedling',
    priceMonthly: 999,
    priceAnnual: 899,
    icon: 'fa-seedling',
  },
  booster: {
    key: 'booster',
    title: 'Rocket',
    priceMonthly: 1999,
    priceAnnual: 1699,
    icon: 'fa-rocket',
    mostPopular: true,
    badge: 'MOST POPULAR',
  },
  master: {
    key: 'master',
    title: 'Owl',
    priceMonthly: 3999,
    priceAnnual: 3499,
    icon: 'fa-feather',
  },
};

const fmtUsd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const CheckoutPage: NextPage = () => {
  const router = useRouter();
  const planParam = String(router.query.plan ?? '');
  const codeParam = router.query.code ? String(router.query.code) : undefined;
  const cycleParam = (String(router.query.billingCycle ?? 'monthly') as Cycle);

  const hasPlan = (['starter', 'booster', 'master'] as PlanKey[]).includes(planParam as PlanKey);
  const plan = (hasPlan ? (planParam as PlanKey) : undefined);

  const selectedPlanData = plan ? PLANS[plan] : undefined;

  const handleSelect: NonNullable<PlanPickerProps['onSelect']> = (p, c) => {
    const qs = new URLSearchParams();
    qs.set('plan', p);
    qs.set('billingCycle', c);
    if (codeParam) qs.set('code', codeParam);
    void router.push(`/checkout?${qs.toString()}`);
  };

  const monthlyCents = selectedPlanData ? (cycleParam === 'monthly' ? selectedPlanData.priceMonthly : selectedPlanData.priceAnnual) : 0;
  const billedAnnualTotalCents = selectedPlanData && cycleParam === 'annual' ? selectedPlanData.priceAnnual * 12 : 0;

  return (
    <>
      <Head>
        <title>Checkout — GramorX</title>
      </Head>

      <main className="min-h-screen bg-background text-foreground antialiased">
        <div className="max-w-6xl mx-auto px-4 pt-6 md:pt-8 pb-12">
          <header className="text-center max-w-3xl mx-auto mb-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-[11px] md:text-xs text-muted-foreground bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
              Flexible plans • Cancel anytime
            </p>

            <h1 className="mt-3 text-balance text-4xl md:text-5xl font-semibold leading-tight">
              <span className="text-gradient-primary">{plan ? 'Complete your purchase' : 'Choose your plan'}</span>
            </h1>

            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              {plan
                ? 'Pay securely to unlock full IELTS modules, AI feedback, and analytics.'
                : 'Pick a plan below — switch billing cycle and proceed to checkout.'}
            </p>
          </header>

          <div className="mx-auto mb-6">
            <SocialProofStrip />
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <div />
            <div>
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
              <div className="bg-card/60 border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <PlanPicker onSelect={handleSelect} defaultCycle={cycleParam} className="mt-0" />
              </div>

              <div className="mt-6">
                <SocialProofStrip />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="rounded-2xl border border-border p-6 md:p-8 bg-card shadow-sm">
                    <div className="flex items-start gap-6">
                      <div className="flex-none">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl bg-gradient-to-br from-purpleVibe to-electricBlue">
                          <i className={`fas ${selectedPlanData?.icon ?? 'fa-star'}`} aria-hidden="true" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold mb-1">
                            {selectedPlanData?.title ?? PLAN_LABEL[plan]}
                          </h2>
                          {selectedPlanData?.mostPopular && (
                            <Badge variant="accent" size="sm" className="inline-flex">
                              {selectedPlanData.badge ?? 'MOST POPULAR'}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {selectedPlanData
                            ? `${PLAN_LABEL[plan]} — ${cycleParam === 'monthly' ? 'Monthly billing' : 'Annual billing (discounted)'}`
                            : ''}
                        </p>

                        <CheckoutForm
                          plan={plan}
                          billingCycle={cycleParam}
                          referralCode={codeParam}
                          className=""
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <RedeemBox />
                  </div>
                </div>

                <aside className="w-full">
                  <div className="rounded-2xl border border-border p-6 bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold">Order summary</h3>
                      <span className="text-sm text-muted-foreground">Review</span>
                    </div>

                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-purpleVibe to-electricBlue">
                            <i className={`fas ${selectedPlanData?.icon ?? 'fa-star'}`} aria-hidden="true" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{selectedPlanData?.title ?? PLAN_LABEL[plan]}</div>
                            <div className="text-xs text-muted-foreground">{cycleParam === 'monthly' ? 'Billed monthly' : 'Billed annually'}</div>
                          </div>
                        </div>

                        {selectedPlanData?.mostPopular && (
                          <div>
                            <Ribbon label={selectedPlanData.badge ?? 'MOST POPULAR'} variant="accent" position="inline" />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between">
                        <span>Price (per month)</span>
                        <span className="font-medium text-foreground">{fmtUsd(monthlyCents)}</span>
                      </div>

                      {cycleParam === 'annual' && (
                        <>
                          <div className="flex justify-between">
                            <span>Billed annually (12 months)</span>
                            <span className="font-medium text-foreground">{fmtUsd(billedAnnualTotalCents)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">You save vs monthly pricing.</div>
                        </>
                      )}

                      {codeParam && (
                        <div className="flex justify-between">
                          <span>Referral</span>
                          <span className="font-mono">{codeParam}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-border/50">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium text-foreground">{cycleParam === 'annual' ? fmtUsd(billedAnnualTotalCents) : fmtUsd(monthlyCents)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Taxes</span>
                          <span className="font-medium text-foreground">—</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">Total</span>
                          <span className="text-lg font-slab text-gradient-primary">
                            {cycleParam === 'annual' ? fmtUsd(billedAnnualTotalCents) : fmtUsd(monthlyCents)}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Final price shown at checkout.</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link
                        href="/pricing"
                        className="block text-center rounded-md border border-border px-3 py-2 text-sm hover:bg-muted transition"
                      >
                        Change plan
                      </Link>
                    </div>
                  </div>
                </aside>
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
