import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';

// Stub env module
const envPath = resolve(__dirname, '../lib/env.ts');
require.cache[envPath] = { exports: { env: {} } };

// Mock Supabase server client
const supabaseClient = {
  auth: {
    getUser: async () => ({ data: { user: { id: 'user1' } } }),
  },
  from: (table: string) => {
    if (table === 'notifications') {
      return {
        select: () => ({
          eq: () => ({
            order: async () => ({ data: [], error: null }),
          }),
        }),
      } as any;
    }
    return {} as any;
  },
};
require.cache[require.resolve('../lib/supabaseServer')] = {
  exports: { createSupabaseServerClient: () => supabaseClient },
};

const handler = require('../pages/api/notifications/index').default;

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

  await handler({ method: 'GET', headers: {} } as any, res as any);
  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.notifications));
  assert.equal(res.body.notifications[0].title, 'Welcome to GramorX!');
  assert.equal(res.body.unread, 1);
  console.log('notifications API default message tested');
})();
