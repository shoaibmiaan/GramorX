import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';

// Stub env module to avoid depending on actual env parsing
const envPath = resolve(__dirname, '../lib/env.ts');
require.cache[envPath] = {
  exports: {
    env: {
      TWILIO_ACCOUNT_SID: 'AC_TEST',
      TWILIO_AUTH_TOKEN: 'AUTH_TEST',
      TWILIO_VERIFY_SERVICE_SID: 'VA_TEST',
      TWILIO_WHATSAPP_FROM: '+10000000000',
      SUPABASE_URL: 'http://localhost',
      SUPABASE_SERVICE_KEY: 'service',
      SUPABASE_SERVICE_ROLE_KEY: 'service_role',
    },
  },
};

// Mock Twilio client with configurable behaviour
let behaviour: 'success' | 'error' = 'success';
const mockClient = {
  verify: {
    services: () => ({
      verifications: {
        create: async () => {
          if (behaviour === 'success') {
            return { sid: 'SID123' };
          }
          throw new Error('Twilio failure');
        },
      },
    }),
  },
};
function TwilioMock() {
  return mockClient;
}
// Replace the real Twilio module
require.cache[require.resolve('twilio')] = { exports: TwilioMock };

const sendOtp = require('../pages/api/send-otp').default;

(async () => {
  // Success response
  behaviour = 'success';
  let statusCode: number | undefined;
  let jsonData: any;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      jsonData = data;
      return data;
    },
  };
  await sendOtp({ method: 'POST', body: { phone: '+1234567890' } }, res as any);
  assert.deepEqual(jsonData, { ok: true, sid: 'SID123' });
  assert.equal(statusCode, undefined);

  // Error handling
  behaviour = 'error';
  statusCode = undefined;
  jsonData = undefined;
  await sendOtp({ method: 'POST', body: { phone: '+1234567890' } }, res as any);
  assert.equal(statusCode, 500);
  assert.deepEqual(jsonData, { ok: false, error: 'Twilio failure' });

  // Method rejection (non-POST)
  let threw = false;
  try {
    await sendOtp({ method: 'GET' } as any, res as any);
  } catch {
    threw = true;
  }
  assert.equal(threw, true);

  console.log('send-otp endpoint tested');
})();
