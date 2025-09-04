'use client';
import React from 'react';
import { useRouter } from 'next/router';
import { Home, BookOpen, PencilLine, User as UserIcon } from 'lucide-react';
import { NavLink } from '@/components/design-system/NavLink';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

const NAV_ITEMS = [
  { href: '/', label: 'Home', Icon: Home, exact: true },
  { href: '/learning', label: 'Courses', Icon: BookOpen },
  { href: '/mock-tests', label: 'Tests', Icon: PencilLine },
  { href: '/profile', label: 'Profile', Icon: UserIcon },
] as const;

export const BottomNav: React.FC = () => {
  const router = useRouter();
  const [hasSession, setHasSession] = React.useState(false);

  React.useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  const gate = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasSession) {
      e.preventDefault();
      router.push('/login?next=' + href);
    }
  };

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40 md:hidden
        border-t border-border
        bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70
      "
      aria-label="Bottom navigation"
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map(({ href, label, Icon, exact }) => (
          <li key={href} className="contents">
            <NavLink
              href={href}
              exact={exact}
              variant="plain"
              onClick={gate(href)}
              className="
                group flex flex-col items-center gap-1 py-2.5
                text-xs text-muted-foreground
                transition
                focus:outline-none focus-visible:ring-2 focus-visible:ring-border
                [&.is-active]:text-primary
              "
              aria-label={label}
            >
              <span
                className="
                  inline-flex h-9 w-9 items-center justify-center rounded-full
                  transition
                  group-[.is-active]:bg-primary/15 group-hover:bg-primary/10
                "
                aria-hidden="true"
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="font-medium">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
