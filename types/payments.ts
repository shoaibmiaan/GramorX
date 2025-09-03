// types/payments.ts
export type PlanKey = 'starter' | 'booster' | 'master';
export type Cycle = 'monthly' | 'annual';
export type PaymentMethod = 'stripe' | 'easypaisa' | 'jazzcash';

export type CreateCheckoutBody = Readonly<{
  plan: PlanKey;
  referralCode?: string;
  billingCycle?: Cycle;
}>;

export type CreateCheckoutResponse =
  | Readonly<{ ok: true; url: string; sessionId?: string }>
  | Readonly<{ ok: false; error: string }>;

export type Invoice = Readonly<{
  id: string;
  amount: number;           // minor units
  currency: string;
  createdAt: string;        // ISO
  hostedInvoiceUrl?: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
}>;

export type SubscriptionSummary = Readonly<{
  plan: 'starter' | 'booster' | 'master' | 'free';
  status: 'active' | 'trialing' | 'canceled' | 'incomplete' | 'past_due';
  renewsAt?: string;
  trialEndsAt?: string;
}>;
