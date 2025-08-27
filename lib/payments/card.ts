import crypto from 'node:crypto';

const API_KEY = process.env.CARD_GATEWAY_API_KEY ?? 'demo_key';
const SECRET = process.env.CARD_GATEWAY_SECRET ?? 'demo_secret';

export async function initiateCardPayment(orderId: string, amount: number) {
  const res = await fetch('https://sandbox.cardgateway.com/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ orderId, amount }),
  });
  const data = await res.json();
  return data.redirectUrl as string;
}

export function verifyCard(payload: { orderId: string; amount: number; signature: string }) {
  const check = crypto
    .createHmac('sha256', SECRET)
    .update(`${payload.orderId}${payload.amount}`)
    .digest('hex');
  return check === payload.signature;
}
