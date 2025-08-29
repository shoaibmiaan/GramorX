import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';

// Stub env to satisfy supabaseBrowser
const envPath = resolve(__dirname, '../lib/env.ts');
require.cache[envPath] = {
  exports: {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
      SUPABASE_URL: 'http://localhost',
      SUPABASE_SERVICE_KEY: 'service',
      SUPABASE_SERVICE_ROLE_KEY: 'service_role',
      TWILIO_ACCOUNT_SID: 'AC_TEST',
      TWILIO_AUTH_TOKEN: 'AUTH_TEST',
      TWILIO_VERIFY_SERVICE_SID: 'VA_TEST',
      TWILIO_WHATSAPP_FROM: '+10000000000',
    },
  },
};

// Mock Supabase client for browser usage
let signInCalled = false;
const supabaseClient = {
  auth: {
    signInWithPassword: async () => {
      signInCalled = true;
      return {
        data: {
          session: {
            user: {
              id: 'user1',
              app_metadata: { role: 'student' },
              user_metadata: {},
            },
            access_token: 'tok',
            refresh_token: 'ref',
          },
        },
        error: null,
      };
    },
    setSession: async () => {},
  },
};
require.cache[require.resolve('@supabase/supabase-js')] = {
  exports: { createClient: () => supabaseClient },
};

// Stub fetch since login page sends login-event
(global as any).fetch = async () => ({});

// Capture redirect path
let assigned: string | undefined;
(global as any).window = { location: { assign: (p: string) => { assigned = p; } } };

const { redirectByRole } = require('../lib/routeAccess');
const supabase = require('../lib/supabaseBrowser').supabaseBrowser;

(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'pw',
  });
  assert.equal(error, null);
  assert.equal(signInCalled, true);
  const path = redirectByRole(data.session.user);
  assert.equal(path, '/dashboard');
  assert.equal(assigned, '/dashboard');
  console.log('login success redirect verified');
})();
