import test from 'node:test';
import assert from 'node:assert';

import {
  canAccess,
  requiredRolesFor,
  isPublicRoute,
  isGuestOnlyRoute,
  redirectByRole,
} from './routeAccess';

test('canAccess respects role gates', () => {
  assert.strictEqual(canAccess('/admin', 'student'), false);
  assert.strictEqual(canAccess('/teacher', 'student'), false);
  assert.strictEqual(canAccess('/admin', 'admin'), true);
  assert.strictEqual(canAccess('/teacher', 'teacher'), true);
  assert.strictEqual(canAccess('/teacher', 'admin'), true);
  assert.strictEqual(canAccess('/admin', 'teacher'), false);
});

test('requiredRolesFor returns the correct roles', () => {
  assert.deepStrictEqual(requiredRolesFor('/admin'), ['admin']);
  assert.deepStrictEqual(requiredRolesFor('/teacher'), ['teacher', 'admin']);
});

test('signup flow paths bypass auth guards', () => {
  assert.strictEqual(isPublicRoute('/signup/phone'), true);
  assert.strictEqual(isGuestOnlyRoute('/signup/phone'), true);
});

test('redirectByRole sends unverified users to verification', () => {
  const user: any = {
    email_confirmed_at: null,
    phone_confirmed_at: null,
    app_metadata: { role: 'student' },
  };
  assert.strictEqual(redirectByRole(user), '/auth/verify');
});

test('verification page is considered public', () => {
  assert.strictEqual(isPublicRoute('/auth/verify'), true);
});
