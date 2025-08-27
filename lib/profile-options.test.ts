import assert from 'node:assert/strict';

import { LEVELS, TIME } from './profile-options';
import { levelGoalMap, timeMultiplierMap } from '../pages/api/ai/profile-suggest';

assert.deepEqual(Object.keys(levelGoalMap), Array.from(LEVELS));
assert.deepEqual(Object.keys(timeMultiplierMap), Array.from(TIME));

console.log('Profile option maps are synchronized.');
