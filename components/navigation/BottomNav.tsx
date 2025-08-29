import React from 'react';
import { NavLink } from '@/components/design-system/NavLink';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: 'fa-home', exact: true },
  { href: '/learning', label: 'Courses', icon: 'fa-book' },
  { href: '/mock-tests', label: 'Tests', icon: 'fa-pencil-alt' },
  { href: '/profile', label: 'Profile', icon: 'fa-user' },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white dark:bg-dark md:hidden">
      <ul className="flex justify-around">
        {NAV_ITEMS.map(({ href, label, icon, exact }) => (
          <li key={href} className="flex-1">
            <NavLink
              href={href}
              exact={exact}
              variant="plain"
              className="flex flex-col items-center gap-1 py-2 text-xs text-gray-600 dark:text-grayish [&.is-active]:text-vibrantPurple"
            >
              <i className={`fas ${icon} text-lg`} aria-hidden />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
