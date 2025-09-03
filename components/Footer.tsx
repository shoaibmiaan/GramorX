import React from 'react';
import { Container } from '@/components/design-system/Container';
import { NavLink } from '@/components/design-system/NavLink';
import { SocialIconLink } from '@/components/design-system/SocialIconLink';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
} from '@/components/design-system/icons';
import { resources, quickLinks, contactInfo } from '@/data/footerLinks';
import { useLocale } from '@/lib/locale';
import { FooterGrid } from '@/components/design-system/FooterGrid';

export const Footer: React.FC = () => {
  const { t } = useLocale();
  return (
    <footer className="py-24 border-t border-border">
      <Container>
        {/* 1 col on mobile -> 2 on small -> 4 on md */}
        <FooterGrid className="gap-10 mb-10">
          {/* Brand + Socials */}
          <div>
            <h3 className="text-xl font-semibold mb-4">GramorX</h3>
            <p className="text-muted-foreground">
              The most advanced IELTS preparation platform powered by AI and expert teaching.
            </p>
            <div className="flex gap-3 mt-4">
              <SocialIconLink href="https://facebook.com" icon={<FacebookIcon className="h-5 w-5" />} label="Facebook" />
              <SocialIconLink href="https://twitter.com" icon={<TwitterIcon className="h-5 w-5" />} label="Twitter / X" />
              <SocialIconLink href="https://instagram.com" icon={<InstagramIcon className="h-5 w-5" />} label="Instagram" />
              <SocialIconLink href="https://linkedin.com" icon={<LinkedinIcon className="h-5 w-5" />} label="LinkedIn" />
              <SocialIconLink href="https://youtube.com" icon={<YoutubeIcon className="h-5 w-5" />} label="YouTube" />
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary">
              IELTS Resources
            </h3>
            <ul className="space-y-2">
              {resources.map((x) => (
                <li key={x.label} className="text-muted-foreground">
                  <NavLink href={x.href} label={t(x.label)} className="!px-0 !py-1" />
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((x) => (
                <li key={x.label} className="text-muted-foreground">
                  <NavLink href={x.href} label={t(x.label)} className="!px-0 !py-1" />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary">
              Contact Us
            </h3>
            <ul className="space-y-3 text-muted-foreground">
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
            </ul>
          </div>
        </FooterGrid>

        <div className="text-center pt-8 border-t border-border text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GramorX. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};
