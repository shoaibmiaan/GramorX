// tools/run-tests.ts
// Minimal TS test runner for CI: set safe envs and run only _tests_/ files.
// Executes with: `npm test` -> "tsx tools/run-tests.ts"

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// --- Safe CI envs so imports that read env don't crash ---
const ensure = (k: string, v: string) => {
  if (!process.env[k]) process.env[k] = v;
};

// Public/client
ensure('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
ensure('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon_dummy');
ensure('NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES', '60');

// Server
ensure('SUPABASE_URL', 'https://example.supabase.co');
ensure('SUPABASE_SERVICE_KEY', 'service_dummy');
ensure('SUPABASE_SERVICE_ROLE_KEY', 'role_dummy');

// Twilio
ensure('TWILIO_ACCOUNT_SID', 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
ensure('TWILIO_AUTH_TOKEN', 'dummytoken');
ensure('TWILIO_VERIFY_SERVICE_SID', 'VAXxxxxxxxxxxxxxxxxxxxxxxxx');
ensure('TWILIO_WHATSAPP_FROM', 'whatsapp:+10000000000');

// ---- Collect tests only from _tests_ (skip lib/*.test.ts for now) ----------
const ROOT = process.cwd();
const TESTS_ROOT = path.join(ROOT, '_tests_');

function collectTests(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) collectTests(p, out);
    else if (p.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

(async () => {
  const testFiles = collectTests(TESTS_ROOT);

  if (testFiles.length === 0) {
    console.log('No tests found in _tests_. Exiting OK.');
    process.exit(0);
  }

  // Import each test file; tests using `node:test` will register & run on import.
  for (const file of testFiles) {
    try {
      await import(pathToFileURL(file).href);
    } catch (err) {
      console.error(`Failed to load test: ${file}`);
      console.error(err);
      process.exit(1);
    }
  }
})();
