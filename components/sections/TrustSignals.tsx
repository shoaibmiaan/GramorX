import React from 'react';
import Image from 'next/image';
import { Container } from '@/components/design-system/Container';

const partners = [
  {
    name: 'British Council',
    logo: '/brand/british-council.svg',
    width: 120,
    height: 40,
  },
  {
    name: 'IDP',
    logo: '/brand/idp.svg',
    width: 80,
    height: 40,
  },
  {
    name: 'Cambridge',
    logo: '/brand/cambridge.svg',
    width: 120,
    height: 40,
  },
];

export const TrustSignals: React.FC = () => {
  return (
    <section id="trust" className="section-light py-24">
      <Container>
        <div className="text-center mb-14">
          <h2 className="font-slab uppercase tracking-tight text-h2 md:text-display text-gradient-primary">
            Trusted By
          </h2>
          <p className="mt-3 text-grayish">
            Official partnerships and certifications
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-80">
          {partners.map((p) => (
            <Image key={p.name} src={p.logo} alt={`${p.name} logo`} width={p.width} height={p.height} />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TrustSignals;
