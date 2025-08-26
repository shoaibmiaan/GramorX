// pages/admin/stop-impersonation.tsx
import { useEffect } from 'react';
import Head from 'next/head';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function StopImpersonation() {
  useEffect(() => {
    (async () => {
      try {
        localStorage.removeItem('impersonating');
        localStorage.removeItem('impUserId');
        localStorage.removeItem('impStartedAt');
        await supabaseBrowser.auth.signOut();
      } finally {
        window.location.replace('/admin');
      }
    })();
  }, []);

  return (
    <>
      <Head><title>Returning…</title></Head>
      <div className="min-h-[100dvh] grid place-items-center">
        <div className="animate-pulse text-sm opacity-70">Signing out and returning to Admin…</div>
      </div>
    </>
  );
}
