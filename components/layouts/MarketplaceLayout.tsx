// components/layouts/MarketplaceLayout.tsx
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';

const MarketplaceLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-card/30">
        <Container className="py-5 sm:py-6 pb-safe md:pb-0">
          <h1 className="font-slab text-xl sm:text-2xl">Coaches & Classes</h1>
          <p className="text-sm text-mutedText mt-1">Find a coach, join a class, or manage bookings.</p>
          <nav className="mt-3 flex flex-wrap gap-2">
            <Item href="/marketplace" label="Marketplace" />
            <Item href="/coach" label="Coaches" />
            <Item href="/classes" label="Classes" />
            <Item href="/bookings" label="Bookings" />
            <Item href="/partners" label="Partners" />
          </nav>
        </Container>
      </section>

      <Container className="py-6 pb-safe md:pb-0">
        <div className="card-surface rounded-ds-2xl p-4">{children}</div>
      </Container>
    </div>
  );
};

export default MarketplaceLayout;
export { MarketplaceLayout };
