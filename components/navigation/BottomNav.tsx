import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

type NavItem = { href: string; label: string; icon: string; exact?: boolean };

const ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: 'fa-home', exact: true },
  { href: '/learning', label: 'Courses', icon: 'fa-book' },
  { href: '/mock-tests', label: 'Tests', icon: 'fa-clipboard-list' },
  { href: '/profile', label: 'Profile', icon: 'fa-user' },
];

export const BottomNav: React.FC = () => {
  const { pathname, asPath } = useRouter();
  const current = asPath || pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-lightBorder bg-white dark:border-vibrantPurple/20 dark:bg-dark md:hidden">
      {ITEMS.map(({ href, label, icon, exact }) => {
        const isActive = exact ? current === href : current.startsWith(href);
        const color = isActive ? 'text-vibrantPurple' : 'text-grayish';
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 ${color}`}
          >
            <i className={`fas ${icon}`} aria-hidden />
            <span className="text-xs">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
