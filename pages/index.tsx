// pages/index.tsx
import React, { useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useLocale } from '@/lib/locale';
import { Section } from '@/components/design-system/Section';
import { commandCenter, scaleRetention } from '@/data/home';
import { CommandCenterTile } from '@/components/sections/CommandCenterTile';
import { RetentionCard } from '@/components/sections/RetentionCard';

// Hero is heavy → hydrate client only
const Hero = dynamic(
  () =>
    import('@/components/sections/Hero').then((m) => m.Hero ?? m.default),
  { ssr: false, loading: () => <div className="min-h-[60vh]" /> }
);

import ExamStrategy from '@/components/sections/ExamStrategy';
import { Modules } from '@/components/sections/Modules';
import { CertificationBadges } from '@/components/sections/CertificationBadges';
import { Testimonials } from '@/components/sections/Testimonials';
import { Pricing } from '@/components/sections/Pricing';
import Waitlist from '@/components/sections/Waitlist';

export default function HomePage() {
  const { t } = useLocale();

  // Smooth scroll for same-page anchors (safe & small)
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!el) return;
      ev.preventDefault();
      const id = el.getAttribute('href')!.slice(1);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', `#${id}`);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      <Head>
        <title>{t('home.title')}</title>
      </Head>

      <Hero />

      {/* Phase-3: Quick Command Center (go anywhere, from anywhere) */}
      <Section id="command-center" Container className="py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {commandCenter.map((x) => (
            <CommandCenterTile
              key={x.href}
              label={t(x.label)}
              href={x.href}
              icon={x.icon}
            />
          ))}
        </div>
      </Section>

      {/* Partners */}
      <CertificationBadges />

      {/* Strategy → Practise → Review (clear path) */}
      <ExamStrategy />

      {/* Core modules */}
      <Modules />

      {/* Phase-3 retention strip */}
      <Section id="scale-retention" Container className="py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {scaleRetention.map((c) => (
            <RetentionCard
              key={c.href}
              heading={t(c.h)}
              description={t(c.p)}
              href={c.href}
              icon={c.icon}
            />
          ))}
        </div>
      </Section>

      {/* Social proof */}
      <Testimonials />

      {/* Monetization always one click away */}
      <Pricing />

      {/* Capture demand */}
      <Waitlist />
    </>
  );
}
