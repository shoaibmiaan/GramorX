import Stripe from 'stripe';
import { env } from '@/lib/env';

const secret = env.STRIPE_SECRET_KEY;
if (!secret) throw new Error('Missing STRIPE_SECRET_KEY');

export const stripe = new Stripe(secret, {
  apiVersion: '2024-06-20',
});

export async function createCheckoutSession(opts: {
  customer?: string;
  customerEmail?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const { customer, customerEmail, priceId, successUrl, cancelUrl, metadata } = opts;
  return stripe.checkout.sessions.create({
    customer,
    customer_email: customerEmail,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
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
