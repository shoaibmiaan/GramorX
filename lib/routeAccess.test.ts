import assert from 'node:assert/strict';

import { canAccess, requiredRolesFor } from './routeAccess';

assert.equal(canAccess('/admin', 'student'), false);
assert.equal(canAccess('/teacher', 'student'), false);
assert.equal(canAccess('/admin', 'admin'), true);
assert.equal(canAccess('/teacher', 'teacher'), true);
assert.equal(canAccess('/teacher', 'admin'), true);
assert.equal(canAccess('/admin', 'teacher'), false);

assert.deepEqual(requiredRolesFor('/admin'), ['admin']);
assert.deepEqual(requiredRolesFor('/teacher'), ['teacher', 'admin']);

console.log('All route access tests passed.');
