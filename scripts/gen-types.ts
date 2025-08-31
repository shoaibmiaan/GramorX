/* Tiny helper to (optionally) regenerate Supabase types using CLI.
 * Requires supabase CLI in PATH and project is linked.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(process.cwd(), 'types/supabase.ts');

const run = spawnSync('supabase', ['gen', 'types', 'typescript', '--linked'], {
  encoding: 'utf-8',
});

if (run.error || run.status !== 0) {
  console.warn('⚠️  supabase CLI not available or project not linked. Keeping existing types.');
  process.exit(0);
}

writeFileSync(out, run.stdout, 'utf-8');
console.log('✅ Generated:', out);
