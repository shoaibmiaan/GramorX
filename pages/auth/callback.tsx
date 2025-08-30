import { useEffect, useState } from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';

export default function AuthCallback() {
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const code = sp.get('code');
      const urlError = sp.get('error_description') || sp.get('error');

      if (urlError) {
        setErr(urlError);
        return;
      }
      if (!code) {
        setErr('Missing authorization code. Please try signing in again.');
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) {
        setErr(error.message);
      } else if (!data.session) {
        setErr('No active session. Please try signing in again.');
      } else {
        try {
          await fetch('/api/auth/login-event', { method: 'POST' });
        } catch (err) {
          console.error(err);
        }
        const user = data.session.user;
        const mfaEnabled = (user.user_metadata as any)?.mfa_enabled;
        const mfaVerified = (user.user_metadata as any)?.mfa_verified;
        if (mfaEnabled && !mfaVerified) {
          window.location.assign('/auth/mfa');
          return;
        }
        redirectByRole(user ?? null);
      }
    })();
  }, []);

  return (
    <AuthLayout title="Signing you in..." subtitle={err ? undefined : 'Please wait...'}>
      {err && (
        <Alert variant="error" title="Error" className="mt-4">
          {err}
        </Alert>
      )}
    </AuthLayout>
  );
}
