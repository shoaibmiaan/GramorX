// pages/checkout/index.tsx
import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

// ✅ Correct import statements for named exports
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';

// Other components
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

type PlanRow = {
  key: PlanKey;
  title: string;
  priceMonthly: number;
  priceAnnual: number;
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
        <div className="py-16">
          <Container>
            <header className="text-center max-w-3xl mx-auto mb-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-caption text-muted-foreground bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
                <i className="fas fa-sync-alt text-xs" aria-hidden="true"></i>
                Flexible plans • Cancel anytime
              </p>

              <h1 className="mt-3 text-balance text-h1">
                <span className="text-gradient-primary">{plan ? 'Complete your purchase' : 'Choose your plan'}</span>
              </h1>

              <p className="mt-2 text-body text-muted-foreground">
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
              <Link
                href="/pricing"
                className="rounded-ds border border-border px-3 py-2 text-body hover:bg-muted transition flex items-center gap-2"
              >
                <i className="fas fa-arrow-left text-xs" aria-hidden="true"></i>
                Back to pricing
              </Link>
            </div>

            {!plan ? (
              <>
                <Card className="card-surface rounded-ds-2xl p-8">
                  <PlanPicker onSelect={handleSelect} defaultCycle={cycleParam} className="mt-0" />
                </Card>

                <div className="mt-8 text-center">
                  <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 p-4 bg-muted/50 rounded-ds-xl">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-shield-alt text-accent" aria-hidden="true"></i>
                      <span className="text-caption">Secure payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-lock text-accent" aria-hidden="true"></i>
                      <span className="text-caption">SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-sync-alt text-accent" aria-hidden="true"></i>
                      <span className="text-caption">Cancel anytime</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <SocialProofStrip />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="card-surface rounded-ds-2xl p-8">
                      <div className="flex items-start gap-6">
                        <div className="flex-none">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl bg-gradient-to-br from-primary to-electricBlue">
                            <i className={`fas ${selectedPlanData?.icon ?? 'fa-star'}`} aria-hidden="true" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h2 className="text-h3 mb-1">
                              {selectedPlanData?.title ?? PLAN_LABEL[plan]}
                            </h2>
                            {selectedPlanData?.mostPopular && (
                              <Badge variant="info" size="md" className="inline-flex">
                                {selectedPlanData.badge ?? 'MOST POPULAR'}
                              </Badge>
                            )}
                          </div>

                          <p className="text-body text-muted-foreground mb-4">
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
                    </Card>

                    <div className="mt-6">
                      <RedeemBox />
                    </div>
                  </div>

                  <aside className="w-full">
                    <Card className="card-surface rounded-ds-2xl p-8 sticky top-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-h4">Order summary</h3>
                        <span className="text-caption text-muted-foreground">Review</span>
                      </div>

                      <div className="space-y-4 text-body text-muted-foreground">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-primary to-electricBlue">
                              <i className={`fas ${selectedPlanData?.icon ?? 'fa-star'}`} aria-hidden="true" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{selectedPlanData?.title ?? PLAN_LABEL[plan]}</div>
                              <div className="text-caption text-muted-foreground">{cycleParam === 'monthly' ? 'Billed monthly' : 'Billed annually'}</div>
                            </div>
                          </div>

                          {selectedPlanData?.mostPopular && (
                            <div>
                              <Badge variant="info" size="sm" className="inline-flex">
                                {selectedPlanData.badge ?? 'MOST POPULAR'}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <span>Price ({cycleParam === 'monthly' ? 'per month' : 'per month, billed annually'})</span>
                          <span className="font-medium text-foreground">{fmtUsd(monthlyCents)}</span>
                        </div>

                        {cycleParam === 'annual' && (
                          <>
                            <div className="flex justify-between">
                              <span>Annual total (12 months)</span>
                              <span className="font-medium text-foreground">{fmtUsd(billedAnnualTotalCents)}</span>
                            </div>
                            <div className="p-3 bg-accent/10 rounded-ds border border-accent/20">
                              <div className="flex items-center gap-2 text-accent">
                                <i className="fas fa-piggy-bank" aria-hidden="true"></i>
                                <span className="text-caption font-medium">You save {fmtUsd((selectedPlanData.priceMonthly * 12) - billedAnnualTotalCents)} compared to monthly billing</span>
                              </div>
                            </div>
                          </>
                        )}

                        {codeParam && (
                          <div className="flex justify-between items-center py-2 border-y border-border/30">
                            <span>Referral code applied</span>
                            <span className="font-mono text-caption bg-muted px-2 py-1 rounded-ds">{codeParam}</span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-border/50">
                          <div className="flex justify-between text-body mb-1">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium text-foreground">
                              {cycleParam === 'annual' ? fmtUsd(billedAnnualTotalCents) : fmtUsd(monthlyCents)}
                            </span>
                          </div>
                          <div className="flex justify-between text-body">
                            <span className="text-muted-foreground">Taxes (calculated at checkout)</span>
                            <span className="font-medium text-foreground">—</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                          <div className="flex justify-between items-center">
                            <span className="text-body font-semibold">Total</span>
                            <span className="text-h4 text-gradient-primary">
                              {cycleParam === 'annual' ? fmtUsd(billedAnnualTotalCents) : fmtUsd(monthlyCents)}
                            </span>
                          </div>
                          <p className="mt-2 text-caption text-muted-foreground">Final price shown at checkout.</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            const qs = new URLSearchParams();
                            if (codeParam) qs.set('code', codeParam);
                            void router.push(`/checkout?${qs.toString()}`);
                          }}
                          className="w-full"
                        >
                          <i className="fas fa-arrow-left text-xs mr-2" aria-hidden="true"></i>
                          Change plan
                        </Button>
                      </div>
                    </Card>
                  </aside>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-ds-lg text-center">
                    <i className="fas fa-rocket text-primary mb-2" aria-hidden="true"></i>
                    <h4 className="font-medium text-caption">Instant access</h4>
                    <p className="text-caption text-muted-foreground">Start immediately after payment</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-ds-lg text-center">
                    <i className="fas fa-shield-alt text-accent mb-2" aria-hidden="true"></i>
                    <h4 className="font-medium text-caption">Secure payment</h4>
                    <p className="text-caption text-muted-foreground">256-bit SSL encryption</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-ds-lg text-center">
                    <i className="fas fa-sync-alt text-primary mb-2" aria-hidden="true"></i>
                    <h4 className="font-medium text-caption">Cancel anytime</h4>
                    <p className="text-caption text-muted-foreground">No long-term commitment</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-caption text-muted-foreground">
                  <Link href="/account/referrals" className="underline-offset-4 hover:underline flex items-center gap-1">
                    <i className="fas fa-ticket-alt text-xs" aria-hidden="true"></i>
                    Don't have a code? Generate yours
                  </Link>
                  <span>•</span>
                  <Link href="/partners" className="underline-offset-4 hover:underline flex items-center gap-1">
                    <i className="fas fa-handshake text-xs" aria-hidden="true"></i>
                    Become a partner
                  </Link>
                  <span>•</span>
                  <Link href="/help" className="underline-offset-4 hover:underline flex items-center gap-1">
                    <i className="fas fa-question-circle text-xs" aria-hidden="true"></i>
                    Need help?
                  </Link>
                </div>
              </>
            )}
          </Container>
        </div>
      </main>
    </>
  );
};

export default CheckoutPage;