import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';

// Stub env module to avoid heavy deps
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

// Mock Twilio client
let behaviour: 'success' | 'error' = 'success';
const twilioClient = {
  verify: {
    services: () => ({
      verificationChecks: {
        create: async () => {
          if (behaviour === 'success') {
            return { status: 'approved' };
          }
          throw new Error('Twilio check failed');
        },
      },
    }),
  },
};
function TwilioMock() {
  return twilioClient;
}
require.cache[require.resolve('twilio')] = { exports: TwilioMock };

// Mock Supabase client
let upsertCalled = false;
const supabaseClient = {
  from: () => ({
    upsert: async () => {
      upsertCalled = true;
      return {};
    },
  }),
};
require.cache[require.resolve('@supabase/supabase-js')] = {
  exports: { createClient: () => supabaseClient },
};

const checkOtp = require('../pages/api/check-otp').default;

(async () => {
  // Success response
  behaviour = 'success';
  upsertCalled = false;
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
  await checkOtp(
    { method: 'POST', body: { phone: '+1234567890', code: '1234' } },
    res as any,
  );
  assert.deepEqual(jsonData, { ok: true, message: 'Phone verified' });
  assert.equal(statusCode, undefined);
  assert.equal(upsertCalled, true);

  // Error handling
  behaviour = 'error';
  statusCode = undefined;
  jsonData = undefined;
  upsertCalled = false;
  await checkOtp(
    { method: 'POST', body: { phone: '+1234567890', code: '1234' } },
    res as any,
  );
  assert.equal(statusCode, 500);
  assert.deepEqual(jsonData, { ok: false, error: 'Twilio check failed' });
  assert.equal(upsertCalled, false);

  // Method rejection (non-POST)
  let threw = false;
  try {
    await checkOtp({ method: 'GET' } as any, res as any);
  } catch {
    threw = true;
  }
  assert.equal(threw, true);

  console.log('check-otp endpoint tested');
})();
