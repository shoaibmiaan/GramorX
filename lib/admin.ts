import { env } from "@/lib/env";
// lib/admin.ts
export function getAdminEmails(): string[] {
  const raw = env.ADMIN_EMAILS || '';
  return raw
    .split(/[,\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
