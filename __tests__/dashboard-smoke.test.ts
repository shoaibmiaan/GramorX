import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const content = readFileSync(join(__dirname, '..', 'pages', 'dashboard', 'index.tsx'), 'utf8');

assert.match(content, /Quick Actions/);
assert.match(content, /Take a Mock Test/);

console.log('dashboard page content verified');
