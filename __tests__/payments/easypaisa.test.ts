import assert from 'node:assert/strict';
import { initiateEasypaisa, verifyEasypaisa } from '@/lib/payments/easypaisa';

(global as any).fetch = async () => ({
  json: async () => ({ redirectUrl: 'https://easypaisa.test/redirect' }),
});

(async () => {
  const url = await initiateEasypaisa('o2', 200);
  assert.equal(url, 'https://easypaisa.test/redirect');
  const sig = require('crypto').createHmac('sha256', 'demo_secret').update('o2200').digest('hex');
  assert.equal(verifyEasypaisa({ orderId: 'o2', amount: 200, signature: sig }), true);
  console.log('Easypaisa payment module works.');
})();
