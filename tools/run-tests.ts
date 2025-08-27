import { execSync } from 'node:child_process';

const baseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
};

function run(cmd: string, compilerOptions: Record<string, unknown>) {
  execSync(cmd, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...baseEnv,
      TS_NODE_COMPILER_OPTIONS: JSON.stringify(compilerOptions),
    },
  });
}

const commonOptions = { module: 'commonjs', verbatimModuleSyntax: false };

try {
  run('node -r ts-node/register lib/routeAccess.test.ts', commonOptions);
  run('node -r ts-node/register lib/profile-options.test.ts', commonOptions);
  run('node --loader ts-node/esm components/ai/SidebarAI.test.ts', {
    module: 'esnext',
    verbatimModuleSyntax: false,
    jsx: 'react-jsx',
  });
  console.log('All tests passed.');
} catch {
  process.exit(1);
}
