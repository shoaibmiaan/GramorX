import assert from 'node:assert/strict';
import { initiateCardPayment, verifyCard } from '@/lib/payments/card';

(global as any).fetch = async () => ({
  json: async () => ({ redirectUrl: 'https://card.test/redirect' }),
});

(async () => {
  const url = await initiateCardPayment('o3', 300);
  assert.equal(url, 'https://card.test/redirect');
  const sig = require('crypto').createHmac('sha256', 'demo_secret').update('o3300').digest('hex');
  assert.equal(verifyCard({ orderId: 'o3', amount: 300, signature: sig }), true);
  console.log('Card payment module works.');
})();
