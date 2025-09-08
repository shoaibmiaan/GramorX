// pages/auth/verify.tsx
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card } from '@/components/design-system/Card';
import { Alert } from '@/components/design-system/Alert';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-sm uppercase tracking-wide text-mutedText">{children}</div>
  );
}

export default function VerifyPage() {
  const router = useRouter();
  const email = typeof router.query.email === 'string' ? router.query.email : null;
  const ref = typeof router.query.ref === 'string' ? router.query.ref : '';

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [resent, setResent] = React.useState(false);

  const hasCode = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('code');
  }, [router.asPath]);

  React.useEffect(() => {
    if (!hasCode) return;
    (async () => {
      setBusy(true);
      setError(null);
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      redirectByRole(data?.session?.user ?? null);
    })();
  }, [hasCode]);

  async function handleResend() {
    if (!email || busy) return;
    setBusy(true);
    setError(null);
    try {
      // @ts-expect-error supabase-js may not expose resend type yet
      const { error: resendErr } = await supabase.auth.resend({ type: 'signup', email });
      if (resendErr) {
        setError(resendErr.message);
      } else {
        setResent(true);
        setNotice('We’ve sent a new verification link.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SectionLabel>Verify your email</SectionLabel>
      <Card className="p-6 rounded-ds-2xl card-surface space-y-4">
        {error && (
          <Alert tone="danger">
            {error.toLowerCase().includes('already registered')
              ? 'This email is already registered. You can log in instead.'
              : error}
          </Alert>
        )}
        {notice && <Alert tone="success">{notice}</Alert>}

        {!hasCode && !error && (
          <div>
            <p className="text-sm text-mutedText mb-3">
              {email
                ? `We’ve sent a confirmation link to ${email}.`
                : 'Check your inbox for a verification link.'}
            </p>
            <div className="flex gap-3 items-center">
              <Button
                size="sm"
                variant="soft"
                onClick={handleResend}
                disabled={!email || busy || resent}
              >
                {resent ? 'Sent ✓' : busy ? 'Sending…' : 'Resend email'}
              </Button>
              <Link
                href={`/login${ref ? `?ref=${ref}` : ''}`}
                className="text-sm text-accent underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}

        {hasCode && !error && (
          <p className="text-sm text-mutedText">Completing sign-in…</p>
        )}
      </Card>
    </>
  );
}
