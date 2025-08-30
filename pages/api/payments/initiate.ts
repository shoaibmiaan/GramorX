import type { NextApiRequest, NextApiResponse } from 'next';
import { initiateJazzCash } from '@/lib/payments/jazzcash';
import { initiateEasypaisa } from '@/lib/payments/easypaisa';
import { initiateCardPayment } from '@/lib/payments/card';
import { initiateStripePayment } from '@/lib/payments/stripe';
import { initiatePaypalPayment } from '@/lib/payments/paypal';

type Body = {
  orderId: string;
  amount: number;
  method: 'jazzcash' | 'easypaisa' | 'card' | 'stripe' | 'paypal';
};

export default async function initiate(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { orderId, amount, method } = req.body as Body;
  try {
    let url: string;
    switch (method) {
      case 'jazzcash':
        url = await initiateJazzCash(orderId, amount);
        break;
      case 'easypaisa':
        url = await initiateEasypaisa(orderId, amount);
        break;
      case 'card':
        url = await initiateCardPayment(orderId, amount);
        break;
      case 'stripe':
        url = await initiateStripePayment(orderId, amount);
        break;
      case 'paypal':
        url = await initiatePaypalPayment(orderId, amount);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported method' });
    }
    return res.json({ url });
  } catch (err: any) {
    console.error('initiate payment error', err);
    return res.status(500).json({ error: err.message });
  }
}
