// pages/auth/verify.tsx
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';

export default function VerifyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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
      } else if (!data.session) {
        setError('Session missing. Please try again.');
      } else {
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
  }, [hasCode, router]);

  const subtitle =
    error
      ? 'Verification failed.'
      : hasCode
      ? 'Completing sign-up...'
      : email
      ? `We’ve emailed a confirmation link to ${email}.`
      : 'Check your inbox for a verification link.';

  return (
    <AuthLayout
      title="Verify your account"
      subtitle={subtitle}
      right={
        <div className="relative w-full h-full flex items-center justify-center bg-primary/10 dark:bg-dark">
          <Image
            src="/brand/logo.png"
            alt="GramorX Logo"
            width={420}
            height={420}
            className="object-contain"
          />
        </div>
      }
      showRightOnMobile
    >
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
    </AuthLayout>
  );
}
