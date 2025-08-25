import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function VerifyPage() {
  const router = useRouter();
  const { code, email } = router.query;
  const [status, setStatus] = useState('Checking your verification status…');

  useEffect(() => {
    if (typeof code === 'string') {
      setStatus('Verifying…');
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          setStatus('Verification link is invalid or expired.');
          return;
        }
        if (data.session) {
          router.replace('/profile-setup');
        }
      });
    } else if (typeof email === 'string') {
      setStatus(`A verification link has been sent to ${email}.`);
    }
  }, [code, email, router]);

  return (
    <AuthLayout title="Verify your account" subtitle={status} />
  );
}
