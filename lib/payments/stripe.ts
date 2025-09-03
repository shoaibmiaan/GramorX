// lib/payments/index.ts
export type PlanKey = 'starter' | 'booster' | 'master';
export type Cycle = 'monthly' | 'annual';
export type PaymentMethod = 'stripe' | 'easypaisa' | 'jazzcash';

export const PLAN_LABEL: Record<PlanKey, string> = {
  starter: 'Seedling',
  booster: 'Rocket',
  master: 'Owl',
};

export type CreateCheckoutBody = Readonly<{
  plan: PlanKey;
  referralCode?: string;
  billingCycle?: Cycle;
}>;

export type CreateCheckoutResponse =
  | Readonly<{ ok: true; url: string; sessionId?: string }>
  | Readonly<{ ok: false; error: string }>;

const endpointFor = (method: PaymentMethod): string =>
  method === 'stripe'
    ? '/api/payments/create-checkout-session'
    : method === 'easypaisa'
    ? '/api/payments/create-easypaisa-session'
    : '/api/payments/create-jazzcash-session';

/**
 * Client-side launcher that calls our API endpoints and follows the redirect URL.
 * Return value contains the API JSON so callers can decide to redirect or not.
 */
export async function startCheckout(
  method: PaymentMethod,
  body: CreateCheckoutBody
): Promise<CreateCheckoutResponse> {
  const endpoint = endpointFor(method);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as CreateCheckoutResponse;
  return json;
}
