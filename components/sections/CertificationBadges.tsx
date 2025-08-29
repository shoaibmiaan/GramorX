import React from 'react';
import Image from 'next/image';
import { Container } from '@/components/design-system/Container';

const badges = [
  { src: '/brand/logo.png', alt: 'GramorX' },
  { src: '/brand/tagline.svg', alt: 'AI tagline' },
];

export const CertificationBadges: React.FC = () => (
  <Container>
    <div className="text-center mb-14">
      <h2 className="font-slab uppercase tracking-tight text-h2 md:text-display text-gradient-primary">
        Our Partners
      </h2>
      <p className="mt-3 text-grayish">Recognized by leading organizations</p>
    </div>

    <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
      {badges.map((b) => (
        <Image key={b.src} src={b.src} alt={b.alt} width={160} height={60} />
      ))}
    </div>
  </Container>
);

export default CertificationBadges;
