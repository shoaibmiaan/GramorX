import React, { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { Modules } from '@/components/sections/Modules';
import { Testimonials } from '@/components/sections/Testimonials';
import { Pricing } from '@/components/sections/Pricing';
import { Waitlist } from '@/components/sections/Waitlist';

const Hero = dynamic(() => import('@/components/sections/Hero').then(m => m.default), {
  ssr: false,
  loading: () => <div style={{ minHeight: '60vh' }} />,
});

export default function HomePage() {
  const [streak, setStreak] = useState(0);
  const onStreakChange = useCallback((n: number) => setStreak(n), []);

  React.useEffect(() => {
    const clickHandler = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const a = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      ev.preventDefault();
      const el = document.querySelector(a.getAttribute('href')!);
      if (el) window.scrollTo({ top: (el as HTMLElement).offsetTop - 80, behavior: 'smooth' });
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, []);

  return (
    <>
      <Hero onStreakChange={onStreakChange} />
      <Modules />
      <Testimonials />
      <Pricing />
      <Waitlist />
    </>
  );
}
