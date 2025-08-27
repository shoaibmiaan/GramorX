// components/Layout.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useStreak } from '@/hooks/useStreak';
import { Breadcrumbs, type Crumb } from '@/components/design-system/Breadcrumbs';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { current } = useStreak();
  const router = useRouter();

  const segments = router.asPath.split('?')[0].split('/').filter(Boolean);
  const crumbs: Crumb[] = segments.map((seg, i) => ({
    label: seg.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));
  const breadcrumbItems = [{ label: 'Home', href: '/' }, ...crumbs];

  return (
    <>
      <Header streak={current} />
      <main>
        {segments.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} className="p-4" />
        )}
        {children}
      </main>
      <Footer />
    </>
  );
};
