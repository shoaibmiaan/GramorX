import crypto from 'node:crypto';

const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID ?? 'demo_merchant';
const PASSWORD = process.env.JAZZCASH_PASSWORD ?? 'demo_password';
const SECRET = process.env.JAZZCASH_SECRET ?? 'demo_secret';

// Simulate initiating a JazzCash payment using sandbox credentials
export async function initiateJazzCash(orderId: string, amount: number) {
  const res = await fetch('https://sandbox.jazzcash.com/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount, merchantId: MERCHANT_ID, password: PASSWORD }),
  });
  const data = await res.json();
  return data.redirectUrl as string;
}

// Verify JazzCash webhook callback using shared secret
export function verifyJazzCash(payload: { orderId: string; amount: number; signature: string }) {
  const check = crypto
    .createHmac('sha256', SECRET)
    .update(payload.orderId + payload.amount)
    .digest('hex');
  return check === payload.signature;
}
