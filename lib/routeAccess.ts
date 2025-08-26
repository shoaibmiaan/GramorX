// lib/routeAccess.ts
import type { User } from '@supabase/supabase-js';
import { extractRole, type AppRole } from './roles';
export type { AppRole } from './roles';

// Extract role from user/app metadata (null if none)
export const getUserRole = (user: User | null | undefined): AppRole | null =>
  extractRole(user);

export const isPublicRoute = (path: string) => {
  // Allow-list public pages. Adjust as needed.
  if (path === '/') return true;
  if (path === '/pricing') return true;
  if (path === '/community') return true;
  if (path === '/about') return true;
  if (path === '/contact') return true;

  // Access-denied page must be public to avoid redirect loops.
  if (path === '/403') return true;

  // Auth pages should stay public:
  if (path === '/login' || path.startsWith('/login/')) return true;
  if (path === '/signup') return true;

  return false; // everything else is protected
};

export const isGuestOnlyRoute = (path: string) =>
  path === '/login' || path.startsWith('/login/') || path === '/signup';

// ---- Role gates -------------------------------------------------------------

type Gate = { pattern: RegExp; roles: AppRole[] };

// Add more gates as needed (e.g., /^\/staff/)
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

  // Protected route with no specific gate still requires some valid role.
  return !!role;
};
