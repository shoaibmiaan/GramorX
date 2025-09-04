// tools/run-tests.ts
/**
 * Test bootstrap for tsx:
 * - Provides env fallbacks so code paths don't early-return undefined.
 * - Imports all test files in _tests_/ recursively.
 */
process.env.NODE_ENV ??= 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon-test-key';
process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY ??= ''; // empty triggers admin test stub in your supabaseAdmin.ts
process.env.TWILIO_BYPASS ??= '1';

import fs from 'node:fs';
import path from 'node:path';

function listTests(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) listTests(p, acc);
    else if (/\.test\.ts$/.test(entry.name)) acc.push(p);
  }
  return acc;
}

async function main() {
  const root = process.cwd();
  const testsDir = path.join(root, '_tests_');
  const tests = listTests(testsDir);

  // eslint-disable-next-line no-console
  console.log('learning modules tested');
  await Promise.all(tests.map((t) => import(t)));
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
