import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJazzCash } from '@/lib/payments/jazzcash';
import { verifyEasypaisa } from '@/lib/payments/easypaisa';
import { verifyCard } from '@/lib/payments/card';
import { verifyStripe } from '@/lib/payments/stripe';
import { verifyPaypal } from '@/lib/payments/paypal';
import { supabaseService } from '@/lib/supabaseService';

type Provider = 'jazzcash' | 'easypaisa' | 'card' | 'stripe' | 'paypal';

export default async function webhook(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const provider = (req.query.provider as Provider) || (req.body.provider as Provider);
  let valid = false;
  switch (provider) {
    case 'jazzcash':
      valid = verifyJazzCash(req.body);
      break;
    case 'easypaisa':
      valid = verifyEasypaisa(req.body);
      break;
    case 'card':
      valid = verifyCard(req.body);
      break;
    case 'stripe':
      valid = verifyStripe(req.body);
      break;
    case 'paypal':
      valid = verifyPaypal(req.body);
      break;
    default:
      return res.status(400).json({ error: 'Unknown provider' });
  }
  if (!valid) return res.status(400).json({ error: 'Invalid signature' });

  const { paymentId, subscriptionId, userId } = req.body;
  if (paymentId) {
    await supabaseService
      .from('payments')
      .update({ status: 'paid', provider, provider_payment_id: paymentId })
      .eq('id', paymentId);
  }
  if (subscriptionId && userId) {
    await supabaseService
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('id', subscriptionId)
      .eq('user_id', userId);
  }
  return res.json({ ok: true });
}
