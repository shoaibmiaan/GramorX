'use server';
import Stripe from 'stripe';
import { env } from '@/lib/env';

const secret = env.STRIPE_SECRET_KEY;
if (!secret) throw new Error('Missing STRIPE_SECRET_KEY');

export const stripe = new Stripe(secret, {
  apiVersion: '2024-06-20',
});

export async function createCheckoutSession(opts: {
  customer: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const { customer, priceId, successUrl, cancelUrl } = opts;
  return stripe.checkout.sessions.create({
    customer,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function getActiveSubscription(customerId: string) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });
  return subs.data[0] ?? null;
}
