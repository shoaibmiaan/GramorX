import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';

// ---- Stub React to capture verifyOtp ----
const captured: any[] = [];
const stateValues = ['+1234567890', '123456', 'verify', null, false];
let stateIdx = 0;
const ReactStub = {
  createElement(type: any, props: any, ...children: any[]) {
    if (type === 'form' && props && typeof props.onSubmit === 'function') {
      captured.push(props.onSubmit);
    }
    return { type, props, children };
  },
  useState(initial: any) {
    return [stateValues[stateIdx++], () => {}];
  },
};
require.cache[require.resolve('react')] = { exports: ReactStub };

// ---- Stub components used by the page ----
const noop = () => null;
require.cache[resolve(__dirname, '../components/layouts/AuthLayout.tsx')] = { exports: noop };
require.cache[resolve(__dirname, '../components/design-system/Input.tsx')] = { exports: noop };
require.cache[resolve(__dirname, '../components/design-system/Button.tsx')] = { exports: noop };
require.cache[resolve(__dirname, '../components/design-system/Alert.tsx')] = { exports: noop };
require.cache[require.resolve('next/link')] = { exports: noop };
require.cache[require.resolve('next/image')] = { exports: noop };

// ---- Mock redirect and Supabase ----
let redirectCalled = false;
require.cache[resolve(__dirname, '../lib/routeAccess.ts')] = {
  exports: { redirectByRole: () => { redirectCalled = true; } },
};
const supabaseMock = {
  auth: {
    signInWithOtp: async () => ({
      data: {
        session: {
          user: { id: 'u1', user_metadata: {} },
          access_token: 'a',
          refresh_token: 'r',
        },
      },
      error: null,
    }),
    setSession: async () => {},
  },
};
require.cache[resolve(__dirname, '../lib/supabaseBrowser.ts')] = {
  exports: { supabaseBrowser: supabaseMock },
};

// Stub fetch so the page's verifyOtp doesn't throw
(global as any).fetch = async () => ({ ok: true });

// ---- Import page and execute verifyOtp ----
const LoginWithPhone = require('../pages/login/phone').default;

(async () => {
  LoginWithPhone();
  assert.equal(typeof captured[0], 'function', 'verifyOtp not captured');
  await captured[0]({ preventDefault() {} });
  assert.equal(redirectCalled, true);
  console.log('phone login success redirects by role');
})();
