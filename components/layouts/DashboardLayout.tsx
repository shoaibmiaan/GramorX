// components/layouts/DashboardLayout.tsx
import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';

/**
 * DashboardLayout
 * - DS tokens only (no hex)
 * - Context header + quick section nav
 * - Body wraps children in a card surface
 */
const DashboardLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Context header */}
      <section className="bg-card/40 border-b border-border">
        <Container className="py-5 sm:py-6 pb-safe md:pb-0">
          <h1 className="text-xl sm:text-2xl font-slab">Your Dashboard</h1>
          <p className="text-sm text-mutedText mt-1">
            Track progress, follow your plan, and jump back into modules.
          </p>

          {/* Quick section nav (DS helper .nav-pill) */}
          <nav className="mt-3 flex flex-wrap gap-2">
            <Link href="/study-plan" className="nav-pill">Study Plan</Link>
            <Link href="/progress" className="nav-pill">Analytics</Link>
            <Link href="/listening" className="nav-pill">Listening</Link>
            <Link href="/reading" className="nav-pill">Reading</Link>
            <Link href="/writing" className="nav-pill">Writing</Link>
            <Link href="/speaking/simulator" className="nav-pill">Speaking</Link>
            <Link href="/pricing" className="nav-pill">Upgrade</Link>
          </nav>
        </Container>
      </section>

      {/* Page body */}
      <Container className="py-5 sm:py-6 pb-safe md:pb-0">
        <div className="card-surface rounded-ds-2xl p-3 sm:p-4">
          {children}
        </div>
      </Container>
    </div>
  );
};

export default DashboardLayout;
/** also export named, so either import style works */
export { DashboardLayout };
