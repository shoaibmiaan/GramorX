'use client';

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
} from '@/components/design-system/icons';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { destinationByRole } from '@/lib/routeAccess';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-small uppercase tracking-wide text-mutedText">
      {children}
    </div>
  );
}

export default function LoginOptions() {
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<'apple' | 'google' | 'facebook' | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  // Only redirect away from /login if we DEFINITELY have a session
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        const rawNext = typeof router.query.next === 'string' ? router.query.next : '';
        const safe =
          rawNext && !rawNext.startsWith('http') && rawNext !== '/login'
            ? rawNext
            : destinationByRole(session.user);
        if (router.asPath !== safe) {
          await router.replace(safe);
          return;
        }
      }

      setReady(true);
    })();

    return () => { mounted = false; };
  }, [router.query.next, router.asPath, router.replace]);

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
    const { role, ...rest } = router.query as Record<string, any>;
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

  const RightPanel = (
    <AuthSidePanel
      title="Sign in to GramorX"
      description="One account for all IELTS modules — Listening, Reading, Writing, and Speaking — with AI feedback and progress tracking."
      features={[
        <>🔒 Secure OAuth (Apple, Google, Facebook)</>,
        <>📱 Phone OTP sign-in</>,
        <>📧 Email &amp; Password</>,
        <>📊 Personalized study plan &amp; analytics</>,
      ]}
      footerLink={
        <>
          By continuing, you agree to our{' '}
          <Link href="/legal/terms" className="text-primary hover:underline hover:text-primary/80 transition">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="text-primary hover:underline hover:text-primary/80 transition">
            Privacy Policy
          </Link>
          .
        </>
      }
    />
  );

  if (!ready) {
    return (
      <AuthLayout title="Checking session…" subtitle="" right={RightPanel} showRightOnMobile>
        <div className="p-6 text-mutedText" aria-live="polite">Please wait…</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Choose a sign-in method."
      right={RightPanel}
      showRightOnMobile
    >
      {err && (
        <Alert variant="error" title="Error" className="mb-4" role="status">
          {err}
        </Alert>
      )}

      {!selectedRole ? (
        <>
          <SectionLabel>Sign in as</SectionLabel>

          {/* Role chooser: soft chips with selected state */}
          <div className="grid gap-3">
            <Button
              onClick={() => chooseRole('student')}
              variant="soft"
              tone="primary"
              size="lg"
              shape="rounded"
              fullWidth
              elevateOnHover
              className="justify-between"
              trailingIcon={<span className="text-mutedText">→</span>}
            >
              <span className="font-medium">Student</span>
            </Button>

            <Button
              onClick={() => chooseRole('teacher')}
              variant="soft"
              tone="accent"
              size="lg"
              shape="rounded"
              fullWidth
              elevateOnHover
              className="justify-between"
              trailingIcon={<span className="text-mutedText">→</span>}
            >
              <span className="font-medium">Teacher</span>
            </Button>
          </div>
        </>
      ) : (
        <>
          <SectionLabel>Continue with</SectionLabel>

          <div className="grid gap-3">
            {/* Apple (Coming Soon) */}
            <Button
              disabled
              variant="soft"
              tone="secondary"
              size="lg"
              shape="rounded"
              fullWidth
              className="relative opacity-75"
              leadingIcon={<AppleIcon className="h-5 w-5" />}
            >
              Continue with Apple
              <Badge variant="info" size="sm" className="absolute right-3 top-2 animate-pulse">
                Coming Soon
              </Badge>
            </Button>

            <Button
              onClick={() => oauth('google')}
              loading={busy === 'google'}
              loadingText="Opening Google…"
              variant="secondary"
              size="lg"
              shape="rounded"
              fullWidth
              leadingIcon={<GoogleIcon className="h-5 w-5" />}
            >
              Continue with Google
            </Button>

            <Button
              onClick={() => oauth('facebook')}
              loading={busy === 'facebook'}
              loadingText="Opening Facebook…"
              variant="secondary"
              size="lg"
              shape="rounded"
              fullWidth
              leadingIcon={<FacebookIcon className="h-5 w-5" />}
            >
              Continue with Facebook
            </Button>

            {/* Email (uses Button href instead of asChild) */}
            <Button
              href={`/login/email${selectedRole ? `?role=${selectedRole}` : ''}`}
              variant="secondary"
              size="lg"
              shape="rounded"
              fullWidth
              leadingIcon={<MailIcon className="h-5 w-5" />}
            >
              Email (Password)
            </Button>

            {/* Phone (Coming Soon) */}
            <Button
              disabled
              variant="soft"
              tone="secondary"
              size="lg"
              shape="rounded"
              fullWidth
              className="relative opacity-75"
              leadingIcon={<SmsIcon className="h-5 w-5" />}
            >
              Phone (OTP)
              <Badge variant="info" size="sm" className="absolute right-3 top-2 animate-pulse">
                Coming Soon
              </Badge>
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-between text-small text-mutedText">
            <div>
              New here?{' '}
              <Link
                href={`/signup${selectedRole ? `?role=${selectedRole}` : ''}`}
                className="text-primary hover:underline hover:text-primary/80 transition"
              >
                Create an account
              </Link>
            </div>
            <Button variant="link" onClick={clearRole} aria-label="Change selected role">
              Change role
            </Button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
