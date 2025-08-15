// components/Layout.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useStreak } from '@/hooks/useStreak';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { current } = useStreak();

  return (
    <>
      <Header streak={current} />
      <main>{children}</main>
      <Footer />
    </>
  );
};
