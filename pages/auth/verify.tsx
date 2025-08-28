// pages/auth/verify.tsx
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';
import SessionDialog, { SessionInfo } from '@/components/auth/SessionDialog';
import type { User } from '@supabase/supabase-js';

export default function VerifyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Read query params safely
  const email = useMemo(
    () => (typeof router.query.email === 'string' ? router.query.email : null),
    [router.query.email]
  );

  // Check if we have a `code` param (OAuth/Magic link)
  const hasCode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const sp = new URLSearchParams(window.location.search);
    return sp.has('code');
  }, [router.asPath]); // rerun if URL changes

  useEffect(() => {
    if (!hasCode) return;

    // Use full URL (Supabase parses code & other params internally)
    (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        window.location.href,
      );
      if (error) {
        setError(error.message);
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
  }, [hasCode, router]);

  const subtitle =
    error
      ? 'Verification failed.'
      : hasCode
      ? 'Completing sign-up...'
      : email
      ? `We’ve emailed a confirmation link to ${email}.`
      : 'Check your inbox for a verification link.';

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
    <AuthLayout title="Verify your account" subtitle={subtitle}>
      {error ? (
        <Alert variant="error" title="Verification error" className="mt-4">
          {error}
        </Alert>
      ) : (
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          {hasCode
            ? 'Verifying your email, please wait...'
            : email
            ? 'Open the email and click the link to continue.'
            : 'If you didn’t receive an email, check spam or try again.'}
        </p>
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
