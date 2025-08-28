import { useEffect, useState } from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';
import SessionDialog, { SessionInfo } from '@/components/auth/SessionDialog';
import type { User } from '@supabase/supabase-js';

export default function AuthCallback() {
  const [err, setErr] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        typeof window !== 'undefined' ? window.location.href : ''
      );
      if (error) {
        setErr(error.message);
      } else {
        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);
        try {
          await fetch('/api/auth/login-event', { method: 'POST' });
        } catch (err) {
          console.error(err);
        }
        try {
          const r = await fetch('/api/auth/sessions');
          const list: SessionInfo[] = await r.json();
          if (Array.isArray(list) && list.length > 1) {
            setSessions(list.slice(1));
            return;
          }
        } catch (err) {
          console.error(err);
        }
        redirectByRole(sessionUser);
      }
    })();
  }, []);

  function closeSessions() {
    redirectByRole(user);
  }

  async function keepOnlyHere() {
    if (sessions) {
      await Promise.all(
        sessions.map((s) => fetch(`/api/auth/sessions/${s.id}`, { method: 'DELETE' }))
      );
    }
    closeSessions();
  }

  return (
    <AuthLayout title="Signing you in..." subtitle={err ? undefined : 'Please wait...'}>
      {err && (
        <Alert variant="error" title="Error" className="mt-4">
          {err}
        </Alert>
      )}
      {sessions && (
        <SessionDialog
          sessions={sessions}
          onKeepOnlyHere={keepOnlyHere}
          onClose={closeSessions}
        />
      )}
    </AuthLayout>
  );
}

