// lib/payments/verify.ts
import { env } from '@/lib/env';

export type VerifyStripeInput = Readonly<{
  rawBody: Buffer;
  signature: string | null | undefined;
}>;

export type VerifyStripeResult =
  | Readonly<{ ok: true; event: unknown }>
  | Readonly<{ ok: false; error: string }>;

export function isDevPayments(): boolean {
  return env.NEXT_PUBLIC_DEV_PAYMENTS === '1';
}

/** Verify a Stripe webhook payload using constructEvent. */
export async function verifyStripeWebhook(input: VerifyStripeInput): Promise<VerifyStripeResult> {
  const secretKey = env.STRIPE_SECRET_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    // In local/dev environments we may not have Stripe configured.
    return { ok: false, error: 'Stripe not configured' };
  }
  if (!input.signature) return { ok: false, error: 'Missing stripe-signature header' };

  // @ts-expect-error TODO: add `stripe` dependency for full types
  const Stripe = (await import('stripe')).default ?? (await import('stripe'));
  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  try {
    const event = stripe.webhooks.constructEvent(input.rawBody, input.signature, webhookSecret);
    return { ok: true, event };
  } catch {
    return { ok: false, error: 'Webhook signature verification failed' };
  }
}
