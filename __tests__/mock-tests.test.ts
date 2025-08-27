import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const content = readFileSync(join(__dirname, '..', 'pages', 'mock-tests', 'index.tsx'), 'utf8');

assert.match(content, /Mock Tests/);
assert.match(content, /Timed full-length tests and section-wise practice with band score simulation/);

console.log('mock tests page content verified');
