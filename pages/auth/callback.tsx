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
      } else {
        try {
          await fetch('/api/auth/login-event', { method: 'POST' });
        } catch (err) {
          console.error(err);
        }
        redirectByRole(data.session?.user ?? null);
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
