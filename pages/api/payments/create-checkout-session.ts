// pages/api/payments/create-checkout-session.ts
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { env } from '@/lib/env';

// ---- Types (I/O) ----
type PlanKey = 'starter' | 'booster' | 'master';
type Cycle = 'monthly' | 'annual';

type CreateCheckoutBody = Readonly<{
  plan: PlanKey;
  referralCode?: string;
  billingCycle?: Cycle;
}>;

type Success = Readonly<{ ok: true; url: string; sessionId?: string }>;
type Failure = Readonly<{ ok: false; error: string }>;
type ResBody = Success | Failure;

// ---- Helpers ----
const isPlan = (v: unknown): v is PlanKey =>
  typeof v === 'string' && ['starter', 'booster', 'master'].includes(v);
const isCycle = (v: unknown): v is Cycle =>
  typeof v === 'string' && ['monthly', 'annual'].includes(v);

const getOrigin = (req: NextApiRequest) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  return `${proto}://${host}`;
};

const priceMap: Record<PlanKey, Record<Cycle, string | undefined>> = {
  starter: {
    monthly: env.STRIPE_PRICE_STARTER_MONTHLY,
    annual: env.STRIPE_PRICE_STARTER_ANNUAL,
  },
  booster: {
    monthly: env.STRIPE_PRICE_BOOSTER_MONTHLY,
    annual: env.STRIPE_PRICE_BOOSTER_ANNUAL,
  },
  master: {
    monthly: env.STRIPE_PRICE_MASTER_MONTHLY,
    annual: env.STRIPE_PRICE_MASTER_ANNUAL,
  },
};

const methodNotAllowed = (res: NextApiResponse<ResBody>) =>
  res.status(405).json({ ok: false, error: 'Method Not Allowed' });

const badRequest = (res: NextApiResponse<ResBody>, msg: string) =>
  res.status(400).json({ ok: false, error: msg });

// ---- Handler ----
const handler: NextApiHandler<ResBody> = async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(res);

  // Body validation
  const body = req.body as Partial<CreateCheckoutBody> | undefined;
  if (!body) return badRequest(res, 'Missing body');
  const plan = isPlan(body.plan) ? body.plan : 'booster';
  const billingCycle = isCycle(body.billingCycle) ? body.billingCycle : 'monthly';
  const referralCode = body.referralCode?.slice(0, 64);

  // Auth (user id for metadata / customer lookup)
  const supabase = createSupabaseServerClient({ req });
  const { data: userResp } = await supabase.auth.getUser();
  const userId = userResp.user?.id || 'anon';

  // Stripe runtime load (avoid hard build dep if not installed yet)
  // @ts-expect-error TODO: add `stripe` to dependencies for full types
  const Stripe = (await import('stripe')).default ?? (await import('stripe'));
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ ok: false, error: 'Stripe not configured' });
  }
  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

  const priceId = priceMap[plan][billingCycle];
  if (!priceId) return badRequest(res, `Missing Stripe price for ${plan}/${billingCycle}`);

  const origin = getOrigin(req);
  const success_url = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`;
  const cancel_url = `${origin}/checkout/cancel?plan=${plan}${referralCode ? `&code=${encodeURIComponent(referralCode)}` : ''}`;

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        success_url,
        cancel_url,
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        client_reference_id: userId,
        metadata: {
          plan,
          billingCycle,
          referralCode: referralCode || '',
          userId,
        },
      },
      {
        idempotencyKey:
          (req.headers['x-idempotency-key'] as string) ||
          `${userId}:${plan}:${billingCycle}`,
      }
    );

    return res.status(200).json({ ok: true, url: session.url || success_url, sessionId: session.id });
  } catch (err) {
    const msg = (err as Error)?.message || 'Stripe error';
    return res.status(500).json({ ok: false, error: msg });
  }
};

export default handler;
