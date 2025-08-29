import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const content = readFileSync(join(__dirname, '..', 'pages', 'login', 'index.tsx'), 'utf8');

assert.match(content, /Sign in to GramorX/);
assert.match(content, /Email \(Password\)/);

console.log('sign-in page content verified');
