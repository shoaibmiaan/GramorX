// pages/index.tsx
import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useLocale } from '@/lib/locale';

// Robust dynamic import for Hero: supports default OR named export
const Hero = dynamic(
  () =>
    import('@/components/sections/Hero')
      .then((mod) =>
        Promise.resolve(mod as typeof import('@/components/sections/Hero'))
      )
      .then((mod) => mod.Hero ?? mod.default),
  { ssr: false, loading: () => <div className="min-h-[60vh]" /> }
);

// Robust static imports for the rest (default OR named export)
import * as ModulesMod from '@/components/sections/Modules';
import * as CertificationBadgesMod from '@/components/sections/CertificationBadges';
import * as TestimonialsMod from '@/components/sections/Testimonials';
import * as PricingMod from '@/components/sections/Pricing';
import * as WaitlistMod from '@/components/sections/Waitlist';
import { HeaderStreakChip } from '@/components/feature/HeaderStreakChip';

type ModulesModule = typeof import('@/components/sections/Modules');
type CertificationBadgesModule = typeof import('@/components/sections/CertificationBadges');
type TestimonialsModule = typeof import('@/components/sections/Testimonials');
type PricingModule = typeof import('@/components/sections/Pricing');
type WaitlistModule = typeof import('@/components/sections/Waitlist') & {
  Waitlist?: typeof import('@/components/sections/Waitlist').default;
};

const ModulesModTyped = ModulesMod as ModulesModule;
const CertificationBadgesModTyped = CertificationBadgesMod as CertificationBadgesModule;
const TestimonialsModTyped = TestimonialsMod as TestimonialsModule;
const PricingModTyped = PricingMod as PricingModule;
const WaitlistModTyped = WaitlistMod as WaitlistModule;

const Modules = ModulesModTyped.Modules ?? ModulesModTyped.default;
const CertificationBadges =
  CertificationBadgesModTyped.CertificationBadges ??
  CertificationBadgesModTyped.default;
const Testimonials =
  TestimonialsModTyped.Testimonials ?? TestimonialsModTyped.default;
const Pricing = PricingModTyped.Pricing ?? PricingModTyped.default;
const Waitlist = WaitlistModTyped.Waitlist ?? WaitlistModTyped.default;

export default function HomePage() {
  const { t } = useLocale();
  // keep your streak logic intact
  const [streak, setStreak] = useState(0);
  const onStreakChange = useCallback((n: number) => setStreak(n), []);

  // Smooth scroll for same-page anchors (unchanged, tightened)
  useEffect(() => {
    const clickHandler = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const a = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;

      const href = a.getAttribute('href');
      if (!href || href.length < 2) return;

      const id = href.slice(1);
      const el = document.getElementById(id);
      if (!el) return;

      ev.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', href);
    };

    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, []);

  return (
    <>
      <Head>
        <title>{t('home.title')}</title>
      </Head>
      <Hero streak={streak} onStreakChange={onStreakChange} />
      <div className="mt-6 flex justify-center">
        <HeaderStreakChip />
      </div>

      <section
        id="partners"
        className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90"
      >
        <CertificationBadges />
      </section>

      <section
        id="modules"
        className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90"
      >
        <Modules />
      </section>

      <section
        id="testimonials"
        className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90"
      >
        <Testimonials />
      </section>

      <section
        id="pricing"
        className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90"
      >
        <Pricing />
      </section>

      <section
        id="waitlist"
        className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90"
      >
        <Waitlist />
      </section>
    </>
  );
}
