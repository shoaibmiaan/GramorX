import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';

// Stub env module
const envPath = resolve(__dirname, '../lib/env.ts');
require.cache[envPath] = {
  exports: {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
      SUPABASE_SERVICE_ROLE_KEY: 'service_role',
      TWILIO_ACCOUNT_SID: 'AC_TEST',
      TWILIO_AUTH_TOKEN: 'AUTH_TEST',
      TWILIO_VERIFY_SERVICE_SID: 'VA_TEST',
      TWILIO_WHATSAPP_FROM: '+10000000000',
    },
  },
};

// Mock Supabase user client
const supabaseUser = {
  auth: {
    getUser: async () => ({ data: { user: { id: 'user1', email: 'u1@example.com' } } }),
  },
};
require.cache[require.resolve('@supabase/supabase-js')] = {
  exports: { createClient: () => supabaseUser },
};

// Mock Supabase admin client
let existing = false;
let inserted: any = null;
const adminClient = {
  from: (table: string) => {
    if (table === 'login_events') {
      return {
        select: () => ({
          eq() {
            return this;
          },
          maybeSingle: async () => ({ data: existing ? { id: 1 } : null }),
        }),
        insert: async (row: any) => {
          inserted = row;
          return {};
        },
      } as any;
    }
    if (table === 'user_profiles') {
      return {
        select: () => ({
          eq() {
            return this;
          },
          maybeSingle: async () => ({ data: { phone: '+1234567890', email: 'u1@example.com' } }),
        }),
      } as any;
    }
    return {} as any;
  },
};
require.cache[require.resolve('@/lib/supabaseAdmin')] = {
  exports: { supabaseAdmin: adminClient },
};

// Mock Twilio client
let smsSent = false;
const twilioClient = {
  verify: {
    services: () => ({
      verifications: {
        create: async () => {
          smsSent = true;
          return { sid: 'SID123' };
        },
      },
    }),
  },
};
function TwilioMock() {
  return twilioClient;
}
require.cache[require.resolve('twilio')] = { exports: TwilioMock };

// Stub fetch for email sending
(global as any).fetch = async () => ({ ok: true });

const handler = require('../pages/api/auth/login-event').default;

(async () => {
  const res = {
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return data;
    },
    statusCode: 200 as number | undefined,
    body: undefined as any,
  };

  // New device triggers OTP
  existing = false;
  smsSent = false;
  inserted = null;
  await handler(
    { method: 'POST', headers: { 'x-forwarded-for': '1.2.3.4', 'user-agent': 'agent' } } as any,
    res as any,
  );
  assert.equal(res.body.newDevice, true);
  assert.equal(inserted.ip_address, '1.2.3.4');
  assert.equal(smsSent, true);

  // Existing device skips OTP
  existing = true;
  smsSent = false;
  inserted = null;
  await handler(
    { method: 'POST', headers: { 'x-forwarded-for': '1.2.3.4', 'user-agent': 'agent' } } as any,
    res as any,
  );
  assert.equal(res.body.newDevice, false);
  assert.equal(smsSent, false);

  console.log('login-event endpoint tested');
})();

