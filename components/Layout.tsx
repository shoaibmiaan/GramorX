import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useStreak } from '@/hooks/useStreak';

type LayoutProps = { children: React.ReactNode };

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { streak } = useStreak();

  return (
    <>
      <Header streak={streak} />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
};
