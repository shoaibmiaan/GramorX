import Stripe from 'stripe';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_123';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' as any });

export async function initiateStripePayment(orderId: string, amount: number) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    metadata: { orderId },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'GramorX Plan' },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${SITE_URL}/checkout?success=1`,
    cancel_url: `${SITE_URL}/checkout?canceled=1`,
  });
  return session.url as string;
}

export function verifyStripe(_payload: any) {
  // In a real implementation you would verify webhook signatures.
  return true;
}
