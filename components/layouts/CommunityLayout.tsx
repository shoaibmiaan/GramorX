// components/layouts/CommunityLayout.tsx
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';

const CommunityLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { pathname } = useRouter();
  const Item = ({ href, label }: { href: string; label: string }) => {
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
      <section className="border-b border-border bg-card/30">
        <Container className="py-5 sm:py-6">
          <h1 className="font-slab text-xl sm:text-2xl">Community</h1>
          <p className="text-sm text-mutedText mt-1">
            Ask questions, chat, and get feedback from peers.
          </p>
          <nav className="mt-3 flex flex-wrap gap-2">
            <Item href="/community" label="Feed" />
            <Item href="/community/questions" label="Questions" />
            <Item href="/community/chat" label="Chat" />
            <Item href="/community/review" label="Peer Reviews" />
          </nav>
        </Container>
      </section>

      <Container className="py-6">
        <div className="card-surface rounded-ds-2xl p-4">{children}</div>
      </Container>
    </div>
  );
};

export default CommunityLayout;
export { CommunityLayout };
