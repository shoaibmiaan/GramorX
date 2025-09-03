// components/sections/CertificationBadges.tsx
import * as React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

type Partner = {
  name: string;
  href: string;
  tagline?: string;
};

const partners: readonly Partner[] = [
  { name: 'British Council (Inspiration)', href: '/about/partners#bc' },
  { name: 'IDP IELTS (Practice Style)', href: '/about/partners#idp' },
  { name: 'Cambridge Prep (Pedagogy)', href: '/about/partners#cambridge' },
  { name: 'CEFR-aligned Skills', href: '/about/partners#cefr' },
  { name: 'AI Evaluation Engine', href: '/about/partners#ai' },
];

export const CertificationBadges: React.FC = () => {
  return (
    <Container>
      <div className="text-center mb-10">
        <h2 className="font-slab text-h2 tracking-tight text-gradient-primary">
          Trusted Exam Prep Standards
        </h2>
        <p className="text-grayish mt-2">
          Inspired by leading bodies and aligned with real IELTS marking criteria.
        </p>
      </div>

      <div
        role="list"
        className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
        aria-label="Trusted standards and inspirations"
      >
        {partners.map((p) => (
          <a
            key={p.name}
            href={p.href}
            role="listitem"
            className="
              block rounded-ds-xl border border-border bg-card/60
              hover:border-electricBlue/40 hover:bg-electricBlue/5
              transition p-4 text-center
            "
          >
            <div className="text-sm font-medium">{p.name}</div>
          </a>
        ))}
      </div>

      <Card className="mt-6 p-4 rounded-ds-xl text-center bg-card/60 border border-border">
        <span className="text-small text-muted-foreground">
          *Names listed as inspirations/standards to describe pedagogy influence. Not official partnerships.
        </span>
      </Card>
    </Container>
  );
};

export default CertificationBadges;
