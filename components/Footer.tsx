'use client';

import React from 'react';
import { Container } from '@/components/design-system/Container';
import { NavLink } from '@/components/design-system/NavLink';
import { SocialIconLink } from '@/components/design-system/SocialIconLink';
import { MailIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@/components/design-system/icons';
import { FooterGrid } from '@/components/design-system/FooterGrid';
import { useLocale } from '@/lib/locale';

import {
  resources,
  quickLinks,
  contactInfo,
  socialLinks,
  brandInfo,
} from '@/data/footerLinks';

// Inline FooterSection (no separate file)
type SectionProps = {
  title: string;
  children: React.ReactNode;
  listClassName?: string;
};

const FooterSection: React.FC<SectionProps> = ({
  title,
  children,
  listClassName = 'space-y-2',
}) => (
  <section aria-labelledby={`footer-${title.replace(/\s+/g, '-').toLowerCase()}`}>
    <h3
      id={`footer-${title.replace(/\s+/g, '-').toLowerCase()}`}
      className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary"
    >
      {title}
    </h3>
    <ul className={listClassName}>{children}</ul>
  </section>
);

export const Footer: React.FC = () => {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <Container>
        <div className="py-24">
          {/* 1 col on mobile → 2 on sm → 4 on md+ */}
          <FooterGrid className="gap-10 mb-10">
            {/* Brand + Socials */}
            <section aria-labelledby="footer-brand">
              <h3 id="footer-brand" className="text-xl font-semibold mb-4">
                {brandInfo.name}
              </h3>
              <p className="text-muted-foreground">{t(brandInfo.description)}</p>

              <div className="flex gap-3 mt-4">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <SocialIconLink
                    key={label}
                    href={href}
                    icon={<Icon className="h-5 w-5" />}
                    label={label}
                  />
                ))}
              </div>
            </section>

            {/* Resources */}
            <FooterSection title={t('IELTS Resources')}>
              {resources.map((x) => (
                <li key={x.label} className="text-muted-foreground">
                  <NavLink href={x.href} label={t(x.label)} className="!px-0 !py-1" />
                </li>
              ))}
            </FooterSection>

            {/* Quick links */}
            <FooterSection title={t('Quick Links')}>
              {quickLinks.map((x) => (
                <li key={x.label} className="text-muted-foreground">
                  <NavLink href={x.href} label={t(x.label)} className="!px-0 !py-1" />
                </li>
              ))}
            </FooterSection>

            {/* Contact */}
            <FooterSection title={t('Contact Us')} listClassName="space-y-3 text-muted-foreground">
              <li>
                <MailIcon className="mr-2 inline h-4 w-4" aria-hidden />
                <a href={`mailto:${t(contactInfo.email)}`} className="hover:underline" aria-label={t('Email us')}>
                  {t(contactInfo.email)}
                </a>
              </li>
              <li>
                <PhoneIcon className="mr-2 inline h-4 w-4" aria-hidden />
                <a href={`tel:${t(contactInfo.phone)}`} className="hover:underline" aria-label={t('Call us')}>
                  {t(contactInfo.phone)}
                </a>
              </li>
              <li>
                <MapPinIcon className="mr-2 inline h-4 w-4" aria-hidden /> <span>{t(contactInfo.location)}</span>
              </li>
              <li>
                <ClockIcon className="mr-2 inline h-4 w-4" aria-hidden /> <span>{t(contactInfo.support)}</span>
              </li>
            </FooterSection>
          </FooterGrid>

          {/* bottom bar */}
          <div className="flex flex-col items-center gap-4 pt-8 border-t border-border md:flex-row md:justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {year} GramorX. {t('All rights reserved.')}
            </p>

            <nav aria-label={t('Legal')}>
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <NavLink href="/legal/privacy" label={t('Privacy')} className="!px-0 !py-0" />
                </li>
                <li>
                  <NavLink href="/legal/terms" label={t('Terms')} className="!px-0 !py-0" />
                </li>
                <li>
                  <NavLink href="/sitemap" label={t('Sitemap')} className="!px-0 !py-0" />
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  );
};
