import { useEffect, useState } from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function Verify() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth
      .exchangeCodeForSession(window.location.href)
      .then(({ error }) => {
        if (error) setError(error.message);
        else window.location.replace('/profile-setup');
      });
  }, []);

  return (
    <AuthLayout title="Email Verification" subtitle="Completing sign-up...">
      {error ? (
        <Alert variant="error" title="Verification failed">
          {error}
        </Alert>
      ) : (
        <p>Verifying your email, please wait...</p>
      )}
    </AuthLayout>
  );
}
