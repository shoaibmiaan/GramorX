// components/design-system/NavLink.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

type Props = {
  href: string;
  children?: React.ReactNode;
  label?: string;
  exact?: boolean;
  className?: string;
  variant?: 'pill' | 'plain';
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const NavLink: React.FC<Props> = ({
  href,
  children,
  label,
  exact = false,
  className = '',
  variant = 'pill',
  ...rest
}) => {
  const { pathname, asPath } = useRouter();
  // consider hashes as internal (e.g., #pricing)
  const current = asPath || pathname;
  const isActive = href.startsWith('#')
    ? current.includes(href)
    : exact
      ? current === href
      : current.startsWith(href);

  const base = variant === 'pill' ? 'nav-pill' : 'inline-flex items-center';
  const active = isActive ? 'is-active' : '';

  return (
    <Link href={href} className={`${base} ${active} ${className}`.trim()} {...rest}>
      {children ?? label}
    </Link>
  );
};

export default NavLink;
