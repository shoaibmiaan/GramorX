import crypto from 'node:crypto';

const STORE_ID = process.env.EASYPAISA_STORE_ID ?? 'demo_store';
const SECRET = process.env.EASYPAISA_SECRET ?? 'demo_secret';

export async function initiateEasypaisa(orderId: string, amount: number) {
  const res = await fetch('https://sandbox.easypaisa.com/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount, storeId: STORE_ID }),
  });
  const data = await res.json();
  return data.redirectUrl as string;
}

export function verifyEasypaisa(payload: { orderId: string; amount: number; signature: string }) {
  const check = crypto
    .createHmac('sha256', SECRET)
    .update(`${payload.orderId}${payload.amount}`)
    .digest('hex');
  return check === payload.signature;
}
