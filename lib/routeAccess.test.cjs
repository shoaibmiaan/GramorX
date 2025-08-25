const test = require('node:test');
const assert = require('node:assert');
require('ts-node/register');
const { canAccess } = require('./routeAccess');

test('student cannot access admin', () => {
  assert.strictEqual(canAccess('/admin', 'student'), false);
});

test('student cannot access teacher', () => {
  assert.strictEqual(canAccess('/teacher', 'student'), false);
});
