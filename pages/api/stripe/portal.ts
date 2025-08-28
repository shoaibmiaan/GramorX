import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/payments';
import { env } from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end();
  const { customerId } = req.body as { customerId?: string };
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: (env.NEXT_PUBLIC_BASE_URL || env.SITE_URL || '') + '/settings/billing',
    });
    return res.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Unable to create portal session' });
  }
}
