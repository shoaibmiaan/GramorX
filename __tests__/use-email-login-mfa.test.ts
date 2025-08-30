import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';

// Stub env module so supabaseBrowser works
const envPath = resolve(__dirname, '../lib/env.ts');
require.cache[envPath] = {
  exports: {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
      SUPABASE_URL: 'http://localhost',
      SUPABASE_SERVICE_KEY: 'service',
      SUPABASE_SERVICE_ROLE_KEY: 'service_role',
    },
  },
};

// Track calls
let challengeCalled = false;
let verifyCalled = false;

const supabaseClient = {
  auth: {
    mfa: {
      challenge: async () => {
        challengeCalled = true;
        return { data: { id: 'challenge1' }, error: null };
      },
      verify: async () => {
        verifyCalled = true;
        return { error: null };
      },
    },
    getUser: async () => ({
      data: {
        user: {
          id: 'user1',
          app_metadata: { role: 'student' },
          email_confirmed_at: '2024-01-01T00:00:00Z',
        },
      },
    }),
  },
};

require.cache[require.resolve('@supabase/supabase-js')] = {
  exports: { createClient: () => supabaseClient },
};

// Ensure a fresh supabaseBrowser uses this client
try { delete require.cache[require.resolve('../lib/supabaseBrowser')]; } catch {}

(global as any).fetch = async () => ({});
(global as any).window = { location: { assign: (_p: string) => {} } };

const { createMfaChallengeForUser, verifyMfaOtp } = require('../hooks/useEmailLoginMFA');

(async () => {
  const res = await createMfaChallengeForUser({ factors: [{ id: 'factor1' }] });
  assert.equal(res.factorId, 'factor1');
  assert.equal(res.challengeId, 'challenge1');
  assert.equal(challengeCalled, true);

  const verifyRes = await verifyMfaOtp(res.factorId, res.challengeId, '123456');
  assert.equal(verifyCalled, true);
  assert.deepEqual(verifyRes, { error: null });
  console.log('useEmailLoginMFA hook behavior verified');
})();
