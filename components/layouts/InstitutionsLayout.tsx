// components/layouts/InstitutionsLayout.tsx
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';

const InstitutionsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { pathname } = useRouter();

  const Item = ({ href, label }: { href: string; label: string }) => {
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

  // Derive org context (best-effort) for quick links
  const match = pathname.match(/^\/institutions\/([^/]+)/);
  const orgId = match?.[1];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky sub-header for B2B */}
      <div className="sticky top-[64px] z-30 border-b border-border bg-background/80 backdrop-blur">
        <Container className="py-4 space-y-2">
          <div>
            <h1 className="font-slab text-xl">Institutions</h1>
            <p className="text-sm text-mutedText">Manage cohorts, students, and reports for your academy.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Item href="/institutions" label="All Orgs" />
            {orgId ? (
              <>
                <Item href={`/institutions/${orgId}`} label="Overview" />
                <Item href={`/institutions/${orgId}/students`} label="Students" />
                <Item href={`/institutions/${orgId}/reports`} label="Reports" />
              </>
            ) : null}
          </div>
        </Container>
      </div>

      <Container className="py-6">
        <div className="card-surface rounded-ds-2xl p-4">{children}</div>
      </Container>
    </div>
  );
};

export default InstitutionsLayout;
export { InstitutionsLayout };
    