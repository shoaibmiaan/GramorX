// types/pricing.ts

export type PlanId = 'free' | 'starter' | 'booster' | 'master';

export interface Plan {
  id: PlanId;
  name: string;
  tagline?: string;
  highlight?: boolean; // UI emphasis (e.g., booster)
  monthlyUSD: number;  // set 0 for free
  annualUSD: number;   // discounted annual, 0 for free
  quota: {
    dailyMocks: number;
    aiEvaluationsPerDay: number;
    storageGB: number;
  };
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Explorer (Free)',
    tagline: 'Start your IELTS journey',
    monthlyUSD: 0,
    annualUSD: 0,
    quota: { dailyMocks: 1, aiEvaluationsPerDay: 2, storageGB: 1 },
    features: [
      'Listening/Reading/Writing/Speaking basic practice',
      'Basic AI feedback (light)',
      'Daily vocab quiz',
      'Community access (read)',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter (Seedling)',
    tagline: 'Build consistent habits',
    monthlyUSD: 9,
    annualUSD: 84,
    quota: { dailyMocks: 2, aiEvaluationsPerDay: 10, storageGB: 5 },
    features: [
      'All Free features',
      'Unlock more mock tests',
      'AI writing/speaking eval – standard',
      'Study plan with reminders',
    ],
  },
  booster: {
    id: 'booster',
    name: 'Booster (Rocket)',
    tagline: 'Serious prep, fast',
    highlight: true,
    monthlyUSD: 19,
    annualUSD: 180,
    quota: { dailyMocks: 5, aiEvaluationsPerDay: 40, storageGB: 15 },
    features: [
      'All Starter features',
      'Advanced analytics & band predictor',
      'Mistake patterns + targeted drills',
      'Priority support',
    ],
  },
  master: {
    id: 'master',
    name: 'Master (Owl)',
    tagline: 'Max score, full control',
    monthlyUSD: 39,
    annualUSD: 360,
    quota: { dailyMocks: 10, aiEvaluationsPerDay: 120, storageGB: 50 },
    features: [
      'All Booster features',
      'Coach feedback slots (when available)',
      'Speaking room & pro prompts',
      'Exportable reports & certificates',
    ],
  },
};

export function getPlan(id: PlanId): Plan {
  return PLANS[id];
}

export function isPaidPlan(id: PlanId) {
  return id !== 'free';
}

export type PlanQuota = Plan['quota'];
