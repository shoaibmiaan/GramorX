// lib/supabaseService.ts
import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';

export const supabaseService = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Comma-separated admin emails
export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const raw = env.ADMIN_EMAILS || '';
  const list = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}
