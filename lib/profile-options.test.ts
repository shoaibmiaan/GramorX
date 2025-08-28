import assert from 'node:assert/strict';
import { resolve } from 'node:path';

import { LEVELS, TIME } from './profile-options';

// Stub env module before requiring profile-suggest
const envPath = resolve(__dirname, './env.ts');
require.cache[envPath] = { exports: { env: { OPENAI_API_KEY: '' } } };

import { levelGoalMap, timeMultiplierMap } from '../pages/api/ai/profile-suggest';

assert.deepEqual(Object.keys(levelGoalMap), Array.from(LEVELS));
assert.deepEqual(Object.keys(timeMultiplierMap), Array.from(TIME));

console.log('Profile option maps are synchronized.');
