import type { User } from '@supabase/supabase-js';
import { supabaseBrowser } from './supabaseBrowser';

// Centralized user-role helpers. Roles are mutually exclusive and ordered by
// privilege (admin > teacher > student).

export type AppRole = 'admin' | 'teacher' | 'student';

// Extract the canonical role from Supabase user metadata. Returns `null` if the
// user has no recognized role.
export function extractRole(user: User | null | undefined): AppRole | null {
  if (!user) return null;
  interface RoleMetadata {
    role?: unknown;
  }
  const r =
    (user.app_metadata as RoleMetadata).role ??
    (user.user_metadata as RoleMetadata).role ??
    null;
  const v = r ? String(r).toLowerCase() : null;
  return v === 'admin' || v === 'teacher' || v === 'student' ? (v as AppRole) : null;
}

// Generic role checker. Admin should pass any role gate automatically.
export function hasRole(
  user: User | null | undefined,
  allowed: AppRole | AppRole[],
): boolean {
  const role = extractRole(user);
  if (!role) return false;
  if (role === 'admin') return true;
  const set = new Set(Array.isArray(allowed) ? allowed : [allowed]);
  return set.has(role);
}

export const isAdmin = (u: User | null | undefined) => extractRole(u) === 'admin';

// Teachers inherit admin privileges. Admins therefore pass `isTeacher` checks.
export const isTeacher = (u: User | null | undefined) => {
  const r = extractRole(u);
  return r === 'teacher' || r === 'admin';
};

// Student-facing areas are accessible to any authenticated role. This helper
// therefore returns true for students, teachers and admins.
export const isStudent = (u: User | null | undefined) => {
  const r = extractRole(u);
  return r === 'student' || r === 'teacher' || r === 'admin';
};

export type { AppRole as Role };

// Client-side helper to fetch the current user's role. Attempts to read the
// role from the auth session and falls back to the `profiles` table if the
// metadata is missing or out of date.
export async function getCurrentRole(): Promise<AppRole | null> {
  const { data } = await supabaseBrowser.auth.getSession();
  const user = data.session?.user ?? null;
  let role = extractRole(user);

  if (!role && user?.id) {
    const { data: prof } = await supabaseBrowser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const r = prof?.role ? String(prof.role).toLowerCase() : null;
    role = r === 'admin' || r === 'teacher' || r === 'student' ? (r as AppRole) : null;
  }

  return role;
}

