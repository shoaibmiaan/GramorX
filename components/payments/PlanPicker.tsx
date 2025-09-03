import * as React from 'react';
import Link from 'next/link';

type PlanKey = 'starter' | 'booster' | 'master';
type Cycle = 'monthly' | 'annual';

export type Plan = Readonly<{
  key: PlanKey;
  title: string;
  subtitle?: string;
  priceMonthly: number; // in your display currency
  priceAnnual: number;  // discounted display
  features: string[];
  badge?: string;
  mostPopular?: boolean;
}>;

export type PlanPickerProps = {
  plans?: Plan[];
  defaultCycle?: Cycle;
  onSelect?: (plan: PlanKey, cycle: Cycle) => void;
  className?: string;
};

const DEFAULT_PLANS: Plan[] = [
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

export default function PlanPicker({
  plans = DEFAULT_PLANS,
  defaultCycle = 'monthly',
  onSelect,
  className = '',
}: PlanPickerProps) {
  const [cycle, setCycle] = React.useState<Cycle>(defaultCycle);

  return (
    <section className={`w-full ${className}`}>
      {/* Billing cycle toggle */}
      <div className="mb-6 inline-flex rounded-xl border border-border p-1">
        {(['monthly','annual'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setCycle(k)}
            className={[
              'px-4 py-2 rounded-lg text-sm',
              cycle === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
            ].join(' ')}
          >
            {k === 'monthly' ? 'Monthly' : 'Annual (save)'}
          </button>
        ))}
      </div>

      {/* Plans grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const price = cycle === 'monthly' ? p.priceMonthly : p.priceAnnual;
          const href = `/checkout?plan=${p.key}&billingCycle=${cycle}`;
          return (
            <div
              key={p.key}
              className={[
                'relative rounded-2xl border border-border p-5',
                p.mostPopular ? 'ring-2 ring-primary' : '',
              ].join(' ')}
            >
              {p.badge ? (
                <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow">
                  {p.badge}
                </div>
              ) : null}

              <h3 className="text-lg font-semibold">{p.title}</h3>
              {p.subtitle ? (
                <p className="text-sm text-muted-foreground">{p.subtitle}</p>
              ) : null}

              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">{price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/ {cycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {onSelect ? (
                <button
                  onClick={() => onSelect(p.key, cycle)}
                  className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Choose {p.title}
                </button>
              ) : (
                <Link
                  href={href}
                  className="mt-5 block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Choose {p.title}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
