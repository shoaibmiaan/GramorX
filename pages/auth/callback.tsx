import { useEffect, useState } from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';

export default function AuthCallback() {
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        typeof window !== 'undefined' ? window.location.href : ''
      );
      if (error) {
        setErr(error.message);
      } else {
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

