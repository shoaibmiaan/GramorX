// pages/index.tsx
import React, { useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLocale } from '@/lib/locale';
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
          {[
            { label: t('home.commandCenter.listening'), href: '/listening', icon: 'fa-headphones' },
            { label: t('home.commandCenter.reading'), href: '/reading', icon: 'fa-book-open' },
            { label: t('home.commandCenter.writing'), href: '/writing', icon: 'fa-pen-nib' },
            { label: t('home.commandCenter.speaking'), href: '/speaking', icon: 'fa-microphone' },
            { label: t('home.commandCenter.progress'), href: '/progress', icon: 'fa-chart-line' },
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
          {[
            {
              h: t('home.retentionStrip.challenge.heading'),
              p: t('home.retentionStrip.challenge.description'),
              href: '/challenge',
              icon: 'fa-trophy',
            },
            {
              h: t('home.retentionStrip.certificate.heading'),
              p: t('home.retentionStrip.certificate.description'),
              href: '/cert/sample',
              icon: 'fa-certificate',
            },
            {
              h: t('home.retentionStrip.teacherPilot.heading'),
              p: t('home.retentionStrip.teacherPilot.description'),
              href: '/teacher',
              icon: 'fa-chalkboard-teacher',
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-ds-2xl border border-purpleVibe/20 p-6 hover:border-purpleVibe/40 hover:-translate-y-1 transition block"
            >
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
