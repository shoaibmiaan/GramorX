import type { User } from '@supabase/supabase-js';
import { extractRole, type AppRole } from './roles';
export type { AppRole } from './roles';

/** Public and guest-only allowlists
 * Everything NOT in PUBLIC is considered protected.
 */
const PUBLIC: string[] = [
  '/', '/pricing', '/community', '/about', '/contact',
  '/auth/verify', '/403', // keep these public to avoid loops
];

const GUEST_ONLY: string[] = [
  '/login', '/signup', '/forgot-password',
];

export const isPublicRoute = (path: string) => PUBLIC.includes(path);
export const isGuestOnlyRoute = (path: string) =>
  GUEST_ONLY.includes(path) ||
  path.startsWith('/login/') ||
  path.startsWith('/signup/');

/** Role extraction */
export const getUserRole = (user: User | null | undefined): AppRole | null =>
  extractRole(user);

/** Role gates */
type Gate = { pattern: RegExp; roles: AppRole[] };
const ROLE_GATES: Gate[] = [
  { pattern: /^\/admin(\/.*)?$/i, roles: ['admin'] },
  { pattern: /^\/teacher(\/.*)?$/i, roles: ['teacher', 'admin'] },
];

export const requiredRolesFor = (path: string): AppRole[] | null => {
  const g = ROLE_GATES.find(g => g.pattern.test(path));
  return g ? g.roles : null;
};

export const canAccess = (path: string, role: AppRole | null | undefined): boolean => {
  if (isPublicRoute(path)) return true;

  const needed = requiredRolesFor(path);
  if (needed) return !!role && needed.includes(role);

  // “Protected but ungated” still requires an authenticated role
  return !!role;
};

/** Internal helper: read a loose role from user/app metadata without touching AppRole type */
function readMetaRole(user: User | null | undefined): string | undefined {
  // Prefer explicit metadata roles; fall back to any direct role for compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u: any = user as any;
  return u?.user_metadata?.role ?? u?.app_metadata?.role ?? u?.role;
}

/** Pick a destination path for a user based on role/onboarding.
 * Callers should push/replace this path; we avoid side effects here.
 */
export function destinationByRole(user: User | null | undefined): string {
  const emailVerified = !!user?.email_confirmed_at;
  const phoneVerified = !!user?.phone_confirmed_at;

  if (user && !emailVerified && !phoneVerified) {
    return '/auth/verify';
  }

  // Handle pending teachers explicitly via metadata role (does not require changing AppRole)
  const metaRole = readMetaRole(user);
  if (metaRole === 'teacher_pending') {
    return '/onboarding/teacher/status';
  }

  const role = getUserRole(user);
  const onboarded = !!(user as unknown as { user_metadata?: { onboarding_complete?: boolean } })?.user_metadata?.onboarding_complete;

  if (role === 'teacher') return '/teacher';
  if (role === 'admin') return '/admin';
  return onboarded ? '/dashboard' : '/welcome';
}

/** Backwards-compatible helper that *navigates* only on client */
export function redirectByRole(user: User | null | undefined) {
  const path = destinationByRole(user);
  if (typeof window !== 'undefined') {
    window.location.assign(path);
  }
  return path;
}
