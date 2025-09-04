// _tests_/login-event.test.ts
import assert from 'node:assert/strict';
import { recordLoginEvent } from '../lib/events/recordLoginEvent';

// ACT
const ok = await recordLoginEvent({
  userId: 'u_test_123',
  email: 'user@example.com',
  provider: 'email',
  ip: '127.0.0.1',
  userAgent: 'node-test',
  meta: { source: 'unit' },
});

// ASSERT
assert.strictEqual(ok, true);

console.log('login-event.test.ts ✅ passed');
