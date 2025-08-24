import type { User } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'teacher' | 'student' | null;

export function extractRole(user: User | null): AppRole {
  if (!user) return null;
  const r =
    (user.app_metadata as any)?.role ??
    (user.user_metadata as any)?.role ??
    null;
  const v = r ? String(r).toLowerCase() : null;
  return (v === 'admin' || v === 'teacher' || v === 'student') ? v : null;
}

export const isAdmin   = (u: User | null) => extractRole(u) === 'admin';
export const isTeacher = (u: User | null) => {
  const r = extractRole(u);
  return r === 'teacher' || r === 'admin'; // admin passes teacher checks
};
