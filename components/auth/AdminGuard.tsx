import React from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import type { ReactNode } from 'react';

/** Guard for staff-only pages (admin or teacher). */
export function AdminGuard({ children }: { children: ReactNode }) {
  return <RoleGuard allow={['admin', 'teacher']}>{children}</RoleGuard>;
}
