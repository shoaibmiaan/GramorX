export type PlanKey = 'starter' | 'booster' | 'master';
export type Cycle = 'monthly' | 'annual';

export const PLAN_LABEL: Record<PlanKey, string> = {
  starter: 'Seedling 🌱',
  booster: 'Rocket 🚀',
  master: 'Owl 👑',
};

export type PlanRow = {
  key: PlanKey;
  title: string;
  priceMonthly: number;
  priceAnnual: number;
  icon: string;
  mostPopular?: boolean;
  badge?: string;
};

export const PLANS: Record<PlanKey, PlanRow> = {
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

export const fmtUsd = (cents: number) => `$${(cents / 100).toFixed(2)}`;