// components/Footer.tsx
import React from 'react';
import { Container } from '@/components/design-system/Container';
import { NavLink } from '@/components/design-system/NavLink';
import { SocialIconLink } from '@/components/design-system/SocialIconLink';

const RESOURCES = [
  { href: '/learning/strategies', label: 'IELTS Preparation Guide' },
  { href: '/reading', label: 'Band Score Calculator' }, // temporary: calculator page later
  { href: '/writing', label: 'Writing Task Samples' },
  { href: '/speaking', label: 'Speaking Practice Questions' },
  { href: '/learning', label: 'Vocabulary Builder' },
] as const;

const QUICK = [
  { href: '/learning/strategies', label: 'Tips & Strategies' },
  { href: '/ai', label: 'AI Assistant' }, // deep link: docked sidebar AI
  { href: '/signup', label: 'Pricing & Plans' },
  { href: '/support', label: 'Support' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
] as const;

// Named export to match Layout import style
export const Footer: React.FC = () => {
  return (
    <footer className="py-16 border-t border-lightBorder dark:border-purpleVibe/20">
      <Container>
        {/* 1 col on mobile -> 2 on small -> 4 on md (mobile-friendly, nothing else changed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          {/* Brand + Socials */}
          <div>
            <h3 className="text-xl font-semibold mb-4">IELTS MasterPortal</h3>
            <p className="text-body dark:text-white">
              The most advanced IELTS preparation platform powered by AI technology and expert
              teaching methodologies.
            </p>
            <div className="flex gap-3 mt-4">
              <SocialIconLink href="https://facebook.com" icon="facebook-f" label="Facebook" />
              <SocialIconLink href="https://twitter.com" icon="twitter" label="Twitter / X" />
              <SocialIconLink href="https://instagram.com" icon="instagram" label="Instagram" />
              <SocialIconLink href="https://linkedin.com" icon="linkedin-in" label="LinkedIn" />
              <SocialIconLink href="https://youtube.com" icon="youtube" label="YouTube" />
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary dark:after:bg-neonGreen">
              IELTS Resources
            </h3>
            <ul className="space-y-2">
              {RESOURCES.map((x) => (
                <li key={x.label} className="text-mutedText dark:text-grayish">
                  <NavLink href={x.href} label={x.label} className="!px-0 !py-1" />
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links (deep routes, no hashes) */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary dark:after:bg-neonGreen">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {QUICK.map((x) => (
                <li key={x.label} className="text-mutedText dark:text-grayish">
                  <NavLink href={x.href} label={x.label} className="!px-0 !py-1" />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact (kept exactly) */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary dark:after:bg-neonGreen">
              Contact Us
            </h3>
            <ul className="space-y-3 text-mutedText dark:text-grayish">
              <li>
                <i className="fas fa-envelope mr-2" />
                <a href="mailto:info@solvioadvisors.com" className="hover:underline">
                  info@solvioadvisors.com
                </a>
              </li>
              <li>
                <i className="fas fa-phone mr-2" />
                <a href="tel:+19722954571" className="hover:underline">
                  +1 (972) 295-4571
                </a>
              </li>
              <li>
                <i className="fas fa-map-marker-alt mr-2" /> Houston, USA
              </li>
              <li>
                <i className="fas fa-clock mr-2" /> Support: 24/7
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-lightBorder dark:border-purpleVibe/20 text-sm text-mutedText dark:text-grayish">
          &copy; {new Date().getFullYear()} IELTS MasterPortal. All rights reserved. Launching soon!
        </div>
      </Container>
    </footer>
  );
};
