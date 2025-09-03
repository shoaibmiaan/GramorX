// pages/api/webhooks/payment.ts
import type { NextApiHandler } from 'next';
import { buffer } from 'micro';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { env } from '@/lib/env';

// Important: disable body parsing so we can verify Stripe signatures
export const config = { api: { bodyParser: false } };

type Ok = { received: true };
type Err = { error: string };

const handler: NextApiHandler<Ok | Err> = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // @ts-expect-error TODO: add `stripe` dependency for full types
  const Stripe = (await import('stripe')).default ?? (await import('stripe'));
  const secretKey = env.STRIPE_SECRET_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  const supabase = createSupabaseServerClient({ req });

  // If Stripe not configured, accept as no-op (useful when testing local gateways)
  if (!secretKey || !webhookSecret) {
    return res.status(200).json({ received: true });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  let event: any;
  try {
    const sig = req.headers['stripe-signature'] as string;
    const raw = await buffer(req);
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed` });
  }

  try {
    // Persist raw event for audit
    try {
      await supabase.from('payment_events').insert([
        {
          provider: 'stripe',
          status: 'webhook_received',
          external_id: event.id,
          metadata: { type: event.type },
        },
      ]);
    } catch {
      /* non-fatal */
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string;
          client_reference_id?: string; // userId
          metadata?: Record<string, string>;
          subscription?: string;
          customer?: string;
        };

        const userId = session.client_reference_id;
        const plan = (session.metadata?.plan as 'starter' | 'booster' | 'master' | undefined) || 'booster';

        if (userId) {
          // Update profile entitlements
          await supabase
            .from('profiles')
            .update({
              membership: plan,
              subscription_status: 'active',
              stripe_customer_id: session.customer,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }

        await supabase.from('payment_events').insert([
          {
            provider: 'stripe',
            status: 'checkout.session.completed',
            external_id: session.id,
            user_id: userId,
            metadata: { plan, subscription: session.subscription, customer: session.customer },
          },
        ]);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        await supabase.from('payment_events').insert([
          {
            provider: 'stripe',
            status: 'invoice.payment_succeeded',
            external_id: invoice.id,
            user_id: null,
            metadata: { amount_paid: invoice.amount_paid, currency: invoice.currency },
          },
        ]);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        // Best-effort: if you store customer->user mapping, update profile
        try {
          const customerId: string | undefined = sub.customer;
          if (customerId) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .maybeSingle();
            if (prof?.id) {
              await supabase
                .from('profiles')
                .update({
                  subscription_status: sub.status,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', prof.id);
            }
          }
        } catch {
          /* non-fatal */
        }
        await supabase.from('payment_events').insert([
          {
            provider: 'stripe',
            status: event.type,
            external_id: sub.id,
            user_id: null,
            metadata: { status: sub.status, current_period_end: sub.current_period_end },
          },
        ]);
        break;
      }

      default:
        // Store unknowns for visibility
        await supabase.from('payment_events').insert([
          {
            provider: 'stripe',
            status: 'unhandled_event',
            external_id: event.id,
            metadata: { type: event.type },
          },
        ]);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message || 'Webhook handler error' });
  }
};

export default handler;
