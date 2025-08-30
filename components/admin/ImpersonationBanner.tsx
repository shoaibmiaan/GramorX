"use client";
// components/admin/ImpersonationBanner.tsx
import React, { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export function ImpersonationBanner() {
  const [show, setShow] = useState(false);
  const [who, setWho] = useState<{ id?: string; email?: string } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const flag = typeof window !== 'undefined' && localStorage.getItem('impersonating') === '1';
      if (!flag) return;
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!alive) return;
      const impUserId = localStorage.getItem('impUserId') || undefined;
      // Only show banner if we can confirm a user and (optionally) the user matches the marked one
      if (user && (!impUserId || user.id === impUserId)) {
        setWho({ id: user.id, email: user.email || undefined });
        setShow(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (!show) return null;

  async function stop() {
    try {
      // Optional: hit API for server-side logging
      fetch('/api/admin/stop-impersonation').catch(() => {});
    } finally {
      localStorage.removeItem('impersonating');
      localStorage.removeItem('impUserId');
      localStorage.removeItem('impStartedAt');
      await supabaseBrowser.auth.signOut();
      window.location.href = '/admin';
    }
  }

  return (
    <div className="w-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100 border-b border-amber-300/60 dark:border-amber-400/30">
      <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between gap-3">
        <div className="text-sm">
          <strong>Impersonation mode</strong>
          {who?.email ? <> — signed in as <span className="underline">{who.email}</span></> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={stop}
            className="text-sm rounded-lg border border-amber-400/60 dark:border-amber-300/30 px-3 py-1.5 hover:bg-amber-200/60 dark:hover:bg-amber-400/20"
          >
            Return to Admin
          </button>
        </div>
      </div>
    </div>
  );
}
