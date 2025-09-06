// pages/pricing/index.tsx
import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

import { Container } from '@/components/design-system/Container';
import { Section } from '@/components/design-system/Section';
import { Card } from '@/components/design-system/Card';
import { Ribbon } from '@/components/design-system/Ribbon';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import SocialProofStrip from '@/components/marketing/SocialProofStrip';

type PlanKey = 'starter' | 'booster' | 'master';
type Cycle = 'monthly' | 'annual';

type PlanRow = {
  key: PlanKey;
  title: 'Seedling' | 'Rocket' | 'Owl';
  subtitle: string;
  priceMonthly: number; // cents
  priceAnnual: number; // cents
  features: string[];
  badge?: string;
  mostPopular?: boolean;
  icon: string;
};

const PLANS: readonly PlanRow[] = [
  {
    key: 'starter',
    title: 'Seedling',
    subtitle: 'Essentials to get started',
    priceMonthly: 999,
    priceAnnual: 899,
    features: ['Daily vocab', '1 grammar drill/week', 'Community access'],
    icon: 'fa-seedling',
  },
  {
    key: 'booster',
    title: 'Rocket',
    subtitle: 'Best for fast progress',
    priceMonthly: 1999,
    priceAnnual: 1699,
    features: ['All IELTS modules', 'AI feedback', 'Mock tests', 'Progress analytics'],
    badge: 'MOST POPULAR',
    mostPopular: true,
    icon: 'fa-rocket',
  },
  {
    key: 'master',
    title: 'Owl',
    subtitle: 'Advanced & coaching',
    priceMonthly: 3999,
    priceAnnual: 3499,
    features: ['Priority support', '1:1 reviews', 'Advanced drills'],
    icon: 'fa-feather',
  },
];

const fmtUsd = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

const PricingPage: NextPage = () => {
  const router = useRouter();
  const referralCode = React.useMemo(() => (router.query.code ? String(router.query.code) : undefined), [router.query]);
  const [cycle, setCycle] = React.useState<Cycle>('monthly');

  const handleSelect = React.useCallback(
    (planKey: PlanKey) => {
      const qs = new URLSearchParams();
      qs.set('plan', planKey);
      qs.set('billingCycle', cycle);
      if (referralCode) qs.set('code', referralCode);
      void router.push(`/checkout?${qs.toString()}`);
    },
    [cycle, referralCode, router]
  );

  return (
    <>
      <Head>
        <title>Pricing — GramorX</title>
        <meta
          name="description"
          content="Choose a GramorX plan for IELTS: AI feedback, mock tests, analytics, and more. Mobile-ready with dark mode."
        />
      </Head>

      <main className="min-h-screen bg-background text-foreground antialiased">
        <Section id="pricing">
          <Container className="pt-6 md:pt-8 pb-12 md:pb-16">
            <header className="text-center max-w-3xl mx-auto">
              <p className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-[11px] md:text-xs text-muted-foreground bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
                Flexible plans • Cancel anytime
              </p>

              <h1 className="mt-3 md:mt-3 text-balance text-4xl md:text-5xl font-semibold leading-tight">
                <span className="text-gradient-primary">Choose your plan</span>
              </h1>

              <p className="mt-2 text-sm md:text-base text-muted-foreground text-pretty">
                Upgrade for full IELTS modules, AI evaluation, and performance analytics.
              </p>
            </header>

            <div className="mx-auto mt-6">
              <SocialProofStrip className="mx-auto" />
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="rounded-full border border-border bg-card p-1 flex">
                <button
                  type="button"
                  className={`px-4 py-1.5 text-sm rounded-full transition ${
                    cycle === 'monthly' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setCycle('monthly')}
                  aria-pressed={cycle === 'monthly'}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`px-4 py-1.5 text-sm rounded-full transition ${
                    cycle === 'annual' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setCycle('annual')}
                  aria-pressed={cycle === 'annual'}
                >
                  Annual <span className="ml-1 opacity-80">(save ~2 months)</span>
                </button>
              </div>
              <span className="text-xs text-muted-foreground">Prices in USD before tax</span>
            </div>

            <section aria-labelledby="plans-heading" className="mt-6 md:mt-8">
              <h2 id="plans-heading" className="sr-only">
                Plans and pricing options
              </h2>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {PLANS.map((p) => {
                  const priceCents = cycle === 'monthly' ? p.priceMonthly : p.priceAnnual;
                  const priceLabel = fmtUsd(priceCents);
                  const periodLabel = cycle === 'monthly' ? 'per month' : 'per month (billed annually)';

                  return (
                    <Card
                      key={p.key}
                      className={`p-7 rounded-2xl relative hover:-translate-y-2 transition hover:shadow-glow ${
                        p.mostPopular ? 'ring-1 ring-accent/40' : ''
                      }`}
                    >
                      <Badge variant={p.mostPopular ? 'accent' : 'info'} size="sm" className="absolute top-4 right-4">
                        {p.mostPopular ? 'FEATURED' : 'STANDARD'}
                      </Badge>

                      {p.badge && <Ribbon label={p.badge} variant="accent" position="top-right" />}

                      <div className="w-17.5 h-17.5 rounded-full flex items-center justify-center mb-6 text-white text-2xl bg-gradient-to-br from-purpleVibe to-electricBlue">
                        <i className={`fas ${p.icon}`} aria-hidden="true" />
                      </div>

                      <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                        <i className="fas fa-circle-check text-neonGreen" aria-hidden="true" />
                        {p.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{p.subtitle}</p>

                      <div className="mb-4">
                        <div className="font-slab text-5xl text-gradient-primary leading-none">{priceLabel}</div>
                        <div className="text-grayish mt-1">{periodLabel}</div>
                      </div>

                      <ul className="mt-2">
                        {p.features.map((f) => (
                          <li
                            key={f}
                            className="py-2 pl-6 border-b border-dashed border-purpleVibe/20 relative text-mutedText dark:text-mutedText"
                          >
                            <span className="absolute left-0 top-2 text-neonGreen font-bold">✓</span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 grid gap-3">
                        <Button
                          variant={p.mostPopular ? 'primary' : 'secondary'}
                          className="w-full justify-center"
                          onClick={() => handleSelect(p.key)}
                          aria-label={`Choose ${p.title} plan (${cycle})`}
                        >
                          Choose {p.title}
                        </Button>
                        <Link href="/waitlist" className="text-electricBlue hover:underline text-sm text-center">
                          Not ready? Join the pre-launch list
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="extras-heading" className="mt-10 grid gap-6 md:grid-cols-3">
              <h2 id="extras-heading" className="sr-only">
                Included features and helpful links
              </h2>

              <Card className="p-6 md:p-7 rounded-2xl">
                <h3 className="text-lg font-medium">All plans include</h3>
                <ul className="mt-3 list-none space-y-2 text-sm text-muted-foreground">
                  <li>Dark/Light UI • Fully responsive</li>
                  <li>Study calendar &amp; streaks</li>
                  <li>Core IELTS practice sets</li>
                </ul>
              </Card>

              <Card className="p-6 md:p-7 rounded-2xl">
                <h3 className="text-lg font-medium">Need a discount?</h3>
                <p className="mt-2 text-sm text-muted-foreground">Have a referral code? You can apply it at checkout.</p>

                <Button
                  variant="primary"
                  className="mt-3 w-full justify-center"
                  onClick={() =>
                    void router.push(
                      referralCode
                        ? `/checkout?plan=booster&billingCycle=${cycle}&code=${encodeURIComponent(referralCode)}`
                        : `/checkout?plan=booster&billingCycle=${cycle}`
                    )
                  }
                  aria-label={`Continue to checkout with Rocket (${cycle})`}
                >
                  Continue to checkout
                </Button>

                <p className="mt-2 text-xs text-muted-foreground">
                  Or{' '}
                  <Link href="/account/referrals" className="underline underline-offset-4 hover:text-foreground">
                    generate your own code
                  </Link>
                  .
                </p>
              </Card>

              <Card className="p-6 md:p-7 rounded-2xl">
                <h3 className="text-lg font-medium">Questions?</h3>
                <ul className="mt-3 list-none space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/terms" className="underline-offset-4 hover:underline">
                      Billing &amp; refunds
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="underline-offset-4 hover:underline">
                      Privacy &amp; data
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="underline-offset-4 hover:underline">
                      Contact support
                    </Link>
                  </li>
                </ul>
              </Card>
            </section>

            <footer className="mt-8 md:mt-10 text-center text-sm text-muted-foreground">
              Prices shown are indicative; taxes may apply at checkout.
            </footer>
          </Container>
        </Section>
      </main>
    </>
  );
};

export default PricingPage;
