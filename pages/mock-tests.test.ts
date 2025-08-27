import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const content = readFileSync(join(__dirname, 'mock-tests.tsx'), 'utf8');

assert.match(content, /Mock Tests/);
assert.match(content, /timed full tests with band score simulation/);

console.log('mock tests page content verified');
