// lib/env.ts
export type Env = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

  // Server-side (optional)
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_SERVICE_KEY?: string;

  // Local payment env (optional – used by your payments files)
  EASYPASA_MERCHANT_ID?: string;
  EASYPASA_SECRET?: string;
  JAZZCASH_MERCHANT_ID?: string;
  JAZZCASH_INTEGRITY_SALT?: string;

  NODE_ENV: 'development' | 'test' | 'production';
};

const read = (key: string, fallback?: string): string =>
  (process.env[key] ?? fallback ?? '') as string;

export const env: Env = {
  NEXT_PUBLIC_SUPABASE_URL: read('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: read('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-test-key'),

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,

  EASYPASA_MERCHANT_ID: process.env.EASYPASA_MERCHANT_ID,
  EASYPASA_SECRET: process.env.EASYPASA_SECRET,
  JAZZCASH_MERCHANT_ID: process.env.JAZZCASH_MERCHANT_ID,
  JAZZCASH_INTEGRITY_SALT: process.env.JAZZCASH_INTEGRITY_SALT,

  NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || 'test',
};

export const isTest = env.NODE_ENV === 'test';
