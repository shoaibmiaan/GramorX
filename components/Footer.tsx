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

const RESOURCES = [
  { href: '/predictor', label: 'Band Score Predictor' },
  { href: '/listening', label: 'Listening Practice' },
  { href: '/reading', label: 'Reading Practice' },
  { href: '/writing', label: 'Writing Task Samples' },
  { href: '/speaking', label: 'Speaking Questions' },
] as const;

const QUICK = [
  { href: '/pricing', label: 'Pricing & Plans' },
  { href: '/account/referrals', label: 'Referral Rewards' },
  { href: '/partners', label: 'Partner Program' },
  { href: '/support', label: 'Support' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
] as const;

export const Footer: React.FC = () => {
  return (
    <footer className="py-16 border-t border-border">
      <Container>
        {/* 1 col on mobile -> 2 on small -> 4 on md */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
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
              {RESOURCES.map((x) => (
                <li key={x.label} className="text-muted-foreground">
                  <NavLink href={x.href} label={x.label} className="!px-0 !py-1" />
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
              {QUICK.map((x) => (
                <li key={x.label} className="text-muted-foreground">
                  <NavLink href={x.href} label={x.label} className="!px-0 !py-1" />
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
                <a href="mailto:info@solvioadvisors.com" className="hover:underline">
                  info@solvioadvisors.com
                </a>
              </li>
              <li>
                <PhoneIcon className="mr-2 inline h-4 w-4" />
                <a href="tel:+19722954571" className="hover:underline">
                  +1 (972) 295-4571
                </a>
              </li>
              <li>
                <MapPinIcon className="mr-2 inline h-4 w-4" /> Houston, USA
              </li>
              <li>
                <ClockIcon className="mr-2 inline h-4 w-4" /> Support: 24/7
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GramorX. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};
