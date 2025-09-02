import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

type PlanId = 'starter' | 'booster' | 'master';
const PLAN_META: Record<PlanId, { name: string; priceMonthly: number; perks: string[] }> = {
  starter: { name: 'Starter 🌱', priceMonthly: 9, perks: ['2 mocks/mo', 'Basic AI feedback'] },
  booster: { name: 'Booster 🚀', priceMonthly: 19, perks: ['All mocks', 'Full AI feedback', 'Analytics'] },
  master:  { name: 'Master 👑',  priceMonthly: 29, perks: ['Everything in Booster', 'Priority support', 'Coach reviews'] },
};

const Shell: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <div className="rounded-2xl border border-border bg-background/50 p-5 shadow-sm">{children}</div>
    </div>
  </div>
);

export default function CheckoutPage() {
  const router = useRouter();
  const planParam = (router.query.plan as string) || 'booster';

  const plan = useMemo(() => {
    if (['starter', 'booster', 'master'].includes(planParam)) return PLAN_META[planParam as PlanId];
    return PLAN_META.booster;
  }, [planParam]);

  return (
    <Shell title="Checkout">
      <div className="grid gap-5">
        <div className="rounded-xl border border-border p-4">
          <div className="text-lg font-semibold">{plan.name}</div>
          <div className="mt-1 text-4xl font-bold">
            ${plan.priceMonthly}
            <span className="ml-1 align-middle text-sm font-normal text-foreground/70">/mo</span>
          </div>
          <ul className="mt-3 list-inside list-disc text-sm text-foreground/80">
            {plan.perks.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="mb-2 text-base font-semibold">Payment</div>
          <p className="text-sm text-foreground/80">
            Payment UI coming next. For now, continue to finish setup and you can manage billing in{' '}
            <Link href="/settings/billing" className="underline underline-offset-4">Billing</Link>.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/pricing" className="text-sm underline underline-offset-4">Change plan</Link>
          <Link
            href={`/settings/billing?activated=1&plan=${encodeURIComponent(planParam)}`}
            className="rounded-xl bg-primary px-4 py-2 font-medium text-background hover:opacity-90"
          >
            Continue
          </Link>
        </div>
      </div>
    </Shell>
  );
}
