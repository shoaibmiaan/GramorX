import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';

// ---- Stub env so supabaseBrowser works ----
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

// ---- Stub React to capture submit handler ----
const captured: any[] = [];
const stateValues = [
  'user@example.com', // email
  'pw',               // password
  null,               // emailErr
  null,               // err
  false,              // loading
  '',                 // otp
  false,              // otpSent
  null,               // factorId
  null,               // challengeId
  false,              // verifying
];
let idx = 0;
const ReactStub = {
  createElement(type: any, props: any, ...children: any[]) {
    if (type === 'form' && props && typeof props.onSubmit === 'function') {
      captured.push(props.onSubmit);
    }
    return { type, props, children };
  },
  useState(initial: any) {
    return [stateValues[idx++], () => {}];
  },
};
require.cache[require.resolve('react')] = { exports: ReactStub };

// ---- Stub components used by the page ----
const noop = () => null;
require.cache[resolve(__dirname, '../components/layouts/AuthLayout.tsx')] = { exports: noop };
require.cache[resolve(__dirname, '../components/design-system/Input.tsx')] = { exports: noop };
require.cache[resolve(__dirname, '../components/design-system/PasswordInput.tsx')] = { exports: noop };
require.cache[resolve(__dirname, '../components/design-system/Button.tsx')] = { exports: noop };
require.cache[resolve(__dirname, '../components/design-system/Alert.tsx')] = { exports: noop };
require.cache[require.resolve('next/link')] = { exports: noop };
require.cache[require.resolve('next/image')] = { exports: noop };

// ---- Mock redirect and Supabase ----
let redirectPath: string | undefined;
require.cache[resolve(__dirname, '../lib/routeAccess.ts')] = {
  exports: { redirectByRole: () => { redirectPath = '/dashboard'; return redirectPath; } },
};

let signInCalled = false;
const supabaseMock = {
  auth: {
    signInWithPassword: async () => {
      signInCalled = true;
      return {
        data: {
          session: {
            user: {},
            access_token: 'tok',
            refresh_token: 'ref',
          },
        },
        error: null,
      };
    },
    setSession: async () => {},
    getUser: async () => ({ data: { user: {} }, error: null }),
  },
};
require.cache[resolve(__dirname, '../lib/supabaseBrowser.ts')] = {
  exports: { supabaseBrowser: supabaseMock },
};

// Stub fetch since the page sends login-event
(global as any).fetch = async () => ({ ok: true });

// ---- Import page and execute submit ----
const LoginWithPassword = require('../pages/login/password').default;

(async () => {
  LoginWithPassword();
  assert.equal(typeof captured[0], 'function', 'submit handler not captured');
  await captured[0]({ preventDefault() {} });
  assert.equal(signInCalled, true);
  assert.equal(redirectPath, '/dashboard');
  console.log('password login success redirects by role');
})();

