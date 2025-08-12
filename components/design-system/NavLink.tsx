import React from 'react';

type Props = {
  href: string;
  label: string;
  className?: string;
};

/**
 * Token-driven nav link with light/dark + focus-ring.
 * Auto-highlights when URL hash/path matches (client-only).
 */
export const NavLink: React.FC<Props> = ({ href, label, className = '' }) => {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      if (href.startsWith('#')) {
        setActive(window.location.hash === href);
      } else {
        setActive(window.location.pathname === href);
      }
    };
    check();
    window.addEventListener('hashchange', check);
    window.addEventListener('popstate', check);
    return () => {
      window.removeEventListener('hashchange', check);
      window.removeEventListener('popstate', check);
    };
  }, [href]);

  const base =
    'px-3 py-2 rounded-ds transition focus:outline-none focus:ring-2 focus:ring-primary/60 dark:focus:ring-electricBlue/60';
  const idle =
    'text-lightText hover:bg-gray-100 dark:text-white dark:hover:bg-purpleVibe/10';
  const activeCls =
    'bg-primary/10 text-primary dark:bg-purpleVibe/15 dark:text-neonGreen';

  return (
    <a href={href} className={`${base} ${active ? activeCls : idle} ${className}`}>
      {label}
    </a>
  );
};
