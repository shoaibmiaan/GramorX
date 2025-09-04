import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthSidePanel from '@/components/layouts/AuthSidePanel';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { Badge } from '@/components/design-system/Badge';
import {
  AppleIcon,
  GoogleIcon,
  FacebookIcon,
  MailIcon,
  SmsIcon,
  ShieldIcon,
  PhoneIcon,
  ChartIcon,
} from '@/components/design-system/icons';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-small uppercase tracking-wide text-grayish dark:text-gray-400/90 mb-3">
      {children}
    </div>
  );
}

export default function LoginOptions() {
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<'apple' | 'google' | 'facebook' | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const roleQuery = typeof router.query.role === 'string' ? router.query.role : null;

    if (roleQuery) {
      setSelectedRole(roleQuery);
      if (typeof window !== 'undefined') localStorage.setItem('selectedRole', roleQuery);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedRole');
      if (stored) {
        setSelectedRole(stored);
        router.replace(
          { pathname: router.pathname, query: { ...router.query, role: stored } },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [router]);

  function chooseRole(role: string) {
    setSelectedRole(role);
    if (typeof window !== 'undefined') localStorage.setItem('selectedRole', role);
    router.replace(
      { pathname: router.pathname, query: { ...router.query, role } },
      undefined,
      { shallow: true }
    );
  }

  function clearRole() {
    setSelectedRole(null);
    if (typeof window !== 'undefined') localStorage.removeItem('selectedRole');
    const { role, ...rest } = router.query;
    router.replace({ pathname: router.pathname, query: { ...rest } }, undefined, { shallow: true });
  }

  async function oauth(provider: 'apple' | 'google' | 'facebook') {
    try {
      setErr(null);
      setBusy(provider);

      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
      const next = `/dashboard${selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : ''}`;
      const redirectTo = origin
        ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
        : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unable to continue.';
      setErr(message);
      setBusy(null);
    }
  }

  const features = [
    (
      <>
        <i className="fas fa-shield-alt text-success" aria-hidden="true" />
        Secure OAuth (Apple, Google, Facebook)
      </>
    ),
    (
      <>
        <i className="fas fa-mobile-alt" aria-hidden="true" />
        Phone OTP sign-in
      </>
    ),
    (
      <>
        <i className="fas fa-envelope" aria-hidden="true" />
        Email &amp; Password
      </>
    ),
    (
      <>
        <i className="fas fa-chart-line text-electricBlue" aria-hidden="true" />
        Personalized study plan &amp; analytics
      </>
    ),
  ];

  const RightPanel = (
    <AuthSidePanel
      title="Sign in to GramorX"
      description="One account for all IELTS modules — Listening, Reading, Writing, and Speaking — with AI feedback and progress tracking."
      features={features}
      footerLink={
        <>
          By continuing, you agree to our{' '}
          <Link href="/legal/terms" className="text-primaryDark hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="text-primaryDark hover:underline">
            Privacy Policy
          </Link>
          .
        </>
      }
    />
  );

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Choose a sign-in method."
      right={RightPanel}
      showRightOnMobile
    >
      {err && (
        <Alert variant="error" title="Error" className="mb-4">
          {err}
        </Alert>
      )}

      {!selectedRole ? (
        <>
          <SectionLabel>Sign in as</SectionLabel>
          <div className="grid gap-3">
            <Button onClick={() => chooseRole('student')} variant="secondary" className="rounded-ds-xl" fullWidth>
              Student
            </Button>
            <Button onClick={() => chooseRole('teacher')} variant="secondary" className="rounded-ds-xl" fullWidth>
              Teacher
            </Button>
          </div>
        </>
      ) : (
        <>
          <SectionLabel>Continue with</SectionLabel>

          <div className="grid gap-3">
            <Button
              onClick={() => oauth('apple')}
              disabled={busy === 'apple'}
              variant="secondary"
              className="rounded-ds-xl"
              fullWidth
            >
              <span className="inline-flex items-center gap-3">
                <AppleIcon className="h-5 w-5" />
                {busy === 'apple' ? 'Opening Apple…' : 'Continue with Apple'}
              </span>
            </Button>

            <Button
              onClick={() => oauth('google')}
              disabled={busy === 'google'}
              variant="secondary"
              className="rounded-ds-xl"
              fullWidth
            >
              <span className="inline-flex items-center gap-3">
                <GoogleIcon className="h-5 w-5" />
                {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
              </span>
            </Button>

            <Button
              onClick={() => oauth('facebook')}
              disabled={busy === 'facebook'}
              variant="secondary"
              className="rounded-ds-xl"
              fullWidth
            >
              <span className="inline-flex items-center gap-3">
                <FacebookIcon className="h-5 w-5" />
                {busy === 'facebook' ? 'Opening Facebook…' : 'Continue with Facebook'}
              </span>
            </Button>

            <Button asChild variant="secondary" className="rounded-ds-xl" fullWidth>
              <Link
                href={`/login/email${selectedRole ? `?role=${selectedRole}` : ''}`}
                aria-label="Sign in with Email and Password"
              >
                <span className="inline-flex items-center gap-3">
                  <MailIcon className="h-5 w-5" />
                  Email (Password)
                </span>
              </Link>
            </Button>

            <Button
              variant="secondary"
              className="rounded-ds-xl"
              fullWidth
              disabled
              aria-disabled="true"
            >
              <span className="inline-flex items-center gap-3">
                <SmsIcon className="h-5 w-5" />
                Phone (OTP)
                <Badge variant="info" size="sm">
                  Coming Soon
                </Badge>
              </span>
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-between text-small text-grayish dark:text-gray-400">
            <div>
              New here?{' '}
              <Link href={`/signup${selectedRole ? `?role=${selectedRole}` : ''}`} className="text-primaryDark hover:underline">
                Create an account
              </Link>
            </div>
            <button className="underline decoration-dotted hover:no-underline" onClick={clearRole}>
              Change role
            </button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
