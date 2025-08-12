import React from 'react';
import { Container } from '@/components/design-system/Container';
import { NavLink } from '@/components/design-system/NavLink';
import { SocialIconLink } from '@/components/design-system/SocialIconLink';

const RESOURCES = [
  { href: '#', label: 'IELTS Preparation Guide' },
  { href: '#', label: 'Band Score Calculator' },
  { href: '#', label: 'Writing Task Samples' },
  { href: '#', label: 'Speaking Practice Questions' },
  { href: '#', label: 'Vocabulary Builder' },
];

const QUICK = [
  { href: '#modules', label: 'Features' },
  { href: '#testimonials', label: 'Success Stories' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#', label: 'Blog' },
  { href: '#', label: 'FAQ' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="py-16 border-t border-gray-200 dark:border-purpleVibe/20">
      <Container>
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <h3 className="text-xl font-semibold mb-4">IELTS MasterPortal</h3>
            <p className="text-lightText dark:text-white">
              The most advanced IELTS preparation platform powered by AI technology and expert
              teaching methodologies.
            </p>
            <div className="flex gap-3 mt-4">
              <SocialIconLink href="#" icon="facebook-f" label="Facebook" />
              <SocialIconLink href="#" icon="twitter" label="Twitter / X" />
              <SocialIconLink href="#" icon="instagram" label="Instagram" />
              <SocialIconLink href="#" icon="linkedin-in" label="LinkedIn" />
              <SocialIconLink href="#" icon="youtube" label="YouTube" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary dark:after:bg-neonGreen">
              IELTS Resources
            </h3>
            <ul className="space-y-2">
              {RESOURCES.map((x) => (
                <li key={x.label} className="text-gray-600 dark:text-grayish">
                  <NavLink href={x.href} label={x.label} className="!px-0 !py-1" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary dark:after:bg-neonGreen">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {QUICK.map((x) => (
                <li key={x.label} className="text-gray-600 dark:text-grayish">
                  <NavLink href={x.href} label={x.label} className="!px-0 !py-1" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary dark:after:bg-neonGreen">
              Contact Us
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-grayish">
              <li>
                <i className="fas fa-envelope mr-2" /> support@example.com
              </li>
              <li>
                <i className="fas fa-phone mr-2" /> +1 (800) 123-4567
              </li>
              <li>
                <i className="fas fa-map-marker-alt mr-2" /> London, UK
              </li>
              <li>
                <i className="fas fa-clock mr-2" /> Support: 24/7
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-gray-200 dark:border-purpleVibe/20 text-sm text-gray-600 dark:text-grayish">
          &copy; 2025 IELTS MasterPortal. All rights reserved. Launching soon!
        </div>
      </Container>
    </footer>
  );
};
