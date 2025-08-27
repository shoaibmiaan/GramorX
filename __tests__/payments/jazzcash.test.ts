import assert from 'node:assert/strict';
import { initiateJazzCash, verifyJazzCash } from '@/lib/payments/jazzcash';

// mock fetch
(global as any).fetch = async () => ({
  json: async () => ({ redirectUrl: 'https://jazzcash.test/redirect' }),
});

(async () => {
  const url = await initiateJazzCash('o1', 100);
  assert.equal(url, 'https://jazzcash.test/redirect');
  const ok = verifyJazzCash({ orderId: 'o1', amount: 100, signature: require('crypto').createHmac('sha256', 'demo_secret').update('o1100').digest('hex') });
  assert.equal(ok, true);
  console.log('JazzCash payment module works.');
})();
