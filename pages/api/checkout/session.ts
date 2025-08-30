import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { createCheckoutSession } from '@/lib/payments';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { priceId } = req.body as { priceId?: string };
  if (!priceId) return res.status(400).json({ error: 'Missing priceId' });

  const supabase = createSupabaseServerClient({ req });
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const origin = req.headers.origin || '';
    const session = await createCheckoutSession({
      customerEmail: user.email || undefined,
      priceId,
      successUrl: `${origin}/dashboard`,
      cancelUrl: `${origin}/pricing`,
      metadata: { userId: user.id },
    });
    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error('stripe session error', err);
    return res.status(500).json({ error: err.message });
  }
}
