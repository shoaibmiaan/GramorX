import React from 'react';
import Link from 'next/link';

type Plan = { id: string; name: string; priceMonthly: number; features: string[]; highlight?: boolean };
const plans: Plan[] = [
  { id: 'starter', name: 'Starter 🌱', priceMonthly: 9, features: ['Limited mocks', 'Basic AI feedback'] },
  { id: 'booster', name: 'Booster 🚀', priceMonthly: 19, features: ['All mocks', 'Full AI feedback', 'Progress analytics'], highlight: true },
  { id: 'master',  name: 'Master 👑',  priceMonthly: 29, features: ['Everything in Booster', 'Priority support', 'Coach reviews'] },
];

const Shell: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
      <div className="rounded-2xl border border-border p-4 sm:p-6 bg-background/50 shadow-sm">{children}</div>
    </div>
  </div>
);

export default function PricingPage() {
  return (
    <Shell title="Choose your plan">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className={`rounded-xl border p-4 ${p.highlight ? 'border-primary' : 'border-border'}`}>
            <div className="mb-2 text-lg font-semibold">{p.name}</div>
            <div className="mb-3 text-3xl font-bold">${p.priceMonthly}<span className="text-base font-normal text-foreground/70">/mo</span></div>
            <ul className="mb-4 list-inside list-disc text-sm text-foreground/80">
              {p.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <Link href={`/checkout?plan=${p.id}`} className="block rounded-xl bg-primary px-4 py-2 text-center font-medium text-background hover:opacity-90">Get {p.name.split(' ')[0]}</Link>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-foreground/70">Need help choosing? <Link href="/progress" className="underline underline-offset-4">See your progress</Link> to find the right plan.</p>
    </Shell>
  );
}
