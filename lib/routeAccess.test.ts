import assert from 'node:assert/strict';

import {
  canAccess,
  requiredRolesFor,
  isPublicRoute,
  isGuestOnlyRoute,
} from './routeAccess';

assert.equal(canAccess('/admin', 'student'), false);
assert.equal(canAccess('/teacher', 'student'), false);
assert.equal(canAccess('/admin', 'admin'), true);
assert.equal(canAccess('/teacher', 'teacher'), true);
assert.equal(canAccess('/teacher', 'admin'), true);
assert.equal(canAccess('/admin', 'teacher'), false);

assert.deepEqual(requiredRolesFor('/admin'), ['admin']);
assert.deepEqual(requiredRolesFor('/teacher'), ['teacher', 'admin']);

// Ensure signup flow paths bypass auth guards
assert.equal(isPublicRoute('/signup/phone'), true);
assert.equal(isGuestOnlyRoute('/signup/phone'), true);

console.log('All route access tests passed.');
