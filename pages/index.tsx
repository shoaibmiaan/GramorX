import React from 'react';
import { Container } from '@/components/design-system/Container';
import { NavLink } from '@/components/design-system/NavLink';
import { SocialIconLink } from '@/components/design-system/SocialIconLink';
import { MailIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@/components/design-system/icons';
import { FooterGrid } from '@/components/design-system/FooterGrid';
import { useLocale } from '@/lib/localeProvider';

import {
  resources,
  quickLinks,
  contactInfo,
  socialLinks,
  brandInfo,
} from '@/data/footerLinks';

type FooterSectionProps = {
  title: string;
  children: React.ReactNode;
  listClassName?: string;
};

const FooterSection: React.FC<FooterSectionProps> = ({ title, children, listClassName }) => (
  <div>
    <h4 className="text-lg font-semibold mb-4">{title}</h4>
    <ul className={listClassName ?? 'space-y-2'}>{children}</ul>
  </div>
);

export const Footer: React.FC = () => {
  const { t } = useLocale();

  return (
    <footer className="py-24 border-t border-border bg-background">
      <Container>
        {/* Responsive 1 → 2 → 4 column grid */}
        <FooterGrid className="gap-10 mb-10">
          {/* Brand + Socials */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{brandInfo.name}</h3>
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
          </div>

          {/* Resources */}
          <FooterSection title="IELTS Resources">
            {resources.map((x) => (
              <li key={x.label} className="text-muted-foreground">
                <NavLink href={x.href} label={t(x.label)} className="!px-0 !py-1" />
              </li>
            ))}
          </FooterSection>

          {/* Quick links */}
          <FooterSection title="Quick Links">
            {quickLinks.map((x) => (
              <li key={x.label} className="text-muted-foreground">
                <NavLink href={x.href} label={t(x.label)} className="!px-0 !py-1" />
              </li>
            ))}
          </FooterSection>

          {/* Contact */}
          <FooterSection title="Contact Us" listClassName="space-y-3 text-muted-foreground">
            <li>
              <MailIcon className="mr-2 inline h-4 w-4" />
              <a href={`mailto:${t(contactInfo.email)}`} className="hover:underline">
                {t(contactInfo.email)}
              </a>
            </li>
            <li>
              <PhoneIcon className="mr-2 inline h-4 w-4" />
              <a href={`tel:${t(contactInfo.phone)}`} className="hover:underline">
                {t(contactInfo.phone)}
              </a>
            </li>
            <li>
              <MapPinIcon className="mr-2 inline h-4 w-4" /> {t(contactInfo.location)}
            </li>
            <li>
              <ClockIcon className="mr-2 inline h-4 w-4" /> {t(contactInfo.support)}
            </li>
          </FooterSection>
        </FooterGrid>

        <div className="text-center pt-8 border-t border-border text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GramorX. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};
