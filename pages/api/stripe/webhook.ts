import type { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import Stripe from 'stripe';
import { stripe } from '@/lib/payments';
import { env } from '@/lib/env';
import { supabaseService } from '@/lib/supabaseService';

export const config = { api: { bodyParser: false } };

async function readBuffer(stream: Readable) {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await readBuffer(req);
  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig || !env.STRIPE_WEBHOOK_SECRET)
    return res.status(400).send('Missing signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const { data: existing } = await supabaseService
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle();
        const userId = existing?.user_id || (sub.metadata as any)?.user_id;
        if (userId) {
          if (event.type === 'customer.subscription.deleted') {
            await supabaseService
              .from('subscriptions')
              .update({ status: 'canceled' })
              .eq('user_id', userId)
              .eq('stripe_subscription_id', sub.id);
          } else {
            await supabaseService.from('subscriptions').upsert(
              {
                user_id: userId,
                stripe_subscription_id: sub.id,
                status: sub.status,
                current_period_end: new Date(
                  sub.current_period_end * 1000,
                ).toISOString(),
              },
              { onConflict: 'stripe_subscription_id' },
            );
          }
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler failed', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  res.json({ received: true });
}
