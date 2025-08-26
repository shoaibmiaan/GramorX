// pages/admin/imp-as.tsx
import { useEffect } from 'react';
import Head from 'next/head';

export default function ImpAs() {
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const userId = u.searchParams.get('u') || '';
      localStorage.setItem('impersonating', '1');
      if (userId) localStorage.setItem('impUserId', userId);
      localStorage.setItem('impStartedAt', String(Date.now()));
      // Send to home (or any page you like)
      window.location.replace('/');
    } catch {
      window.location.replace('/');
    }
  }, []);

  return (
    <>
      <Head><title>Switching…</title></Head>
      <div className="min-h-[100dvh] grid place-items-center">
        <div className="animate-pulse text-sm opacity-70">Switching to impersonated session…</div>
      </div>
    </>
  );
}
