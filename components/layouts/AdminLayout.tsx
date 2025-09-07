// components/layouts/AdminLayout.tsx
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';

/**
 * AdminLayout
 * - Shared shell for /admin and /teacher consoles (keeps global header/footer from <Layout />)
 * - Sticky sub-nav with active state; DS tokens only
 * - Place main content in a card surface
 */
const AdminLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { pathname } = useRouter();

  const AdminItem: React.FC<{ href: string; label: string }> = ({ href, label }) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={`nav-pill ${active ? 'bg-primary/10 text-primary' : ''}`}
      >
        {label}
      </Link>
    );
  };

  const TeacherItem: React.FC<{ href: string; label: string }> = ({ href, label }) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={`nav-pill ${active ? 'bg-accent/10 text-accent' : ''}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky sub-header */}
      <div className="sticky top-[64px] z-30 border-b border-border bg-background/80 backdrop-blur">
        <Container className="py-3 space-y-2">
          <div>
            <h1 className="font-slab text-xl">Admin & Teacher Console</h1>
            <p className="text-sm text-mutedText">Manage partners, students, reviews, and cohorts.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Admin */}
            <AdminItem href="/admin" label="Admin Overview" />
            <AdminItem href="/admin/partners" label="Partners" />
            <AdminItem href="/admin/students" label="Students" />
            <AdminItem href="/admin/reviews" label="Reviews" />
            <AdminItem href="/admin/content/reading" label="Content" />

            {/* Teacher */}
            <TeacherItem href="/teacher" label="Teacher Home" />
            <TeacherItem href="/teacher/cohorts" label="Cohorts" />
          </div>
        </Container>
      </div>

      {/* Body */}
      <Container className="py-6">
        <div className="card-surface rounded-ds-2xl p-4">
          {children}
        </div>
      </Container>
    </div>
  );
};

export default AdminLayout;
export { AdminLayout };
