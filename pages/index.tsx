// pages/index.tsx
import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLocale } from '@/lib/locale';
import { Container } from '@/components/design-system/Container';
import { Section } from '@/components/design-system/Section';

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
  const [streak, setStreak] = useState(0);
  const onStreakChange = useCallback((n: number) => setStreak(n), []);

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

      <Hero onStreakChange={onStreakChange} />

      {/* Phase-3: Quick Command Center (go anywhere, from anywhere) */}
      <Section id="command-center">
        <Container>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Listening', href: '/listening', icon: 'fa-headphones' },
              { label: 'Reading', href: '/reading', icon: 'fa-book-open' },
              { label: 'Writing', href: '/writing', icon: 'fa-pen-nib' },
              { label: 'Speaking', href: '/speaking', icon: 'fa-microphone' },
              { label: 'Progress', href: '/progress', icon: 'fa-chart-line' },
            ].map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="
                  rounded-ds-xl border border-border px-4 py-3 text-sm font-medium
                  hover:bg-electricBlue/5 transition flex items-center justify-between
                "
              >
                <span>{x.label}</span>
                <i className={`fas ${x.icon} text-grayish`} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Partners */}
      <CertificationBadges />

      {/* Strategy → Practise → Review (clear path) */}
      <ExamStrategy />

      {/* Core modules */}
      <Modules />

      {/* Phase-3 retention strip */}
      <Section id="scale-retention">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { h: '14-Day Challenge', p: 'Join cohorts, finish daily tasks, climb leaderboard.', href: '/challenge', icon: 'fa-trophy' },
              { h: 'Shareable Certificate', p: 'Finish a challenge to generate a branded cert.', href: '/cert/sample', icon: 'fa-certificate' },
              { h: 'Teacher Pilot', p: 'Assign tasks and track students (beta).', href: '/teacher', icon: 'fa-chalkboard-teacher' },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="rounded-ds-2xl border border-purpleVibe/20 p-6 hover:border-purpleVibe/40 hover:-translate-y-1 transition block">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full grid place-items-center text-white bg-gradient-to-br from-purpleVibe to-electricBlue">
                    <i className={`fas ${c.icon}`} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-h3 mb-1">{c.h}</h3>
                    <p className="text-grayish">{c.p}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
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
