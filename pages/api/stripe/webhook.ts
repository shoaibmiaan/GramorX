import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/payments';
import { env } from '@/lib/env';
import { supabaseService } from '@/lib/supabaseService';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const buf = Buffer.concat(chunks);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig as string, env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error('stripe webhook verify failed', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId = session.subscription as string | null;
    const userId = session.metadata?.userId as string | undefined;
    if (subscriptionId && userId) {
      await supabaseService
        .from('subscriptions')
        .upsert(
          { id: subscriptionId, user_id: userId, status: 'active' },
          { onConflict: 'id' }
        );
    }
  }

  res.json({ received: true });
}
