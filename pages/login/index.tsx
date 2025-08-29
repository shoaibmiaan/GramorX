import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
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

  // Right-side: soft brand panel (no Card), token gradients, light/dark compliant
  const RightPanel = (
    <div className="hidden md:flex w-1/2">
      <div className="h-full flex flex-col justify-between p-8 md:p-12 bg-gradient-to-br from-purpleVibe/10 via-electricBlue/5 to-neonGreen/10 dark:from-dark/50 dark:via-dark/30 dark:to-darker/60">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/brand/logo.png"
            alt="GramorX"
            width={40}
            height={40}
            className="rounded-ds object-contain"
            priority
          />
          <h2 className="font-slab text-h2 text-gradient-primary">Sign in to GramorX</h2>
        </div>
        <p className="text-body text-grayish dark:text-gray-300 max-w-md">
          One account for all IELTS modules — Listening, Reading, Writing, and Speaking — with AI
          feedback and progress tracking.
        </p>

        <ul className="mt-6 space-y-3 text-body text-grayish dark:text-gray-300">
          <li className="flex items-center gap-3">
            <i className="fas fa-shield-alt text-success" aria-hidden />
            Secure OAuth (Apple, Google, Facebook)
          </li>
          <li className="flex items-center gap-3">
            <i className="fas fa-mobile-alt" aria-hidden />
            Phone OTP sign-in
          </li>
          <li className="flex items-center gap-3">
            <i className="fas fa-envelope" aria-hidden />
            Email &amp; Password
          </li>
          <li className="flex items-center gap-3">
            <i className="fas fa-chart-line text-electricBlue" aria-hidden />
            Personalized study plan &amp; analytics
          </li>
        </ul>
      </div>

        <div className="pt-8">
          <div className="text-small text-grayish dark:text-gray-400">
            By continuing, you agree to our{' '}
            <Link href="/legal/terms" className="text-primaryDark hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="text-primaryDark hover:underline">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Choose a sign-in method."
      right={RightPanel}
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
            <Button onClick={() => chooseRole('student')} variant="secondary" className="rounded-ds-xl w-full">
              Student
            </Button>
            <Button onClick={() => chooseRole('teacher')} variant="secondary" className="rounded-ds-xl w-full">
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
              className="rounded-ds-xl w-full"
            >
              <span className="inline-flex items-center gap-3">
                <i className="fab fa-apple text-xl" aria-hidden />
                {busy === 'apple' ? 'Opening Apple…' : 'Continue with Apple'}
              </span>
            </Button>

            <Button
              onClick={() => oauth('google')}
              disabled={busy === 'google'}
              variant="secondary"
              className="rounded-ds-xl w-full"
            >
              <span className="inline-flex items-center gap-3">
                <i className="fab fa-google text-xl" aria-hidden />
                {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
              </span>
            </Button>

            <Button
              onClick={() => oauth('facebook')}
              disabled={busy === 'facebook'}
              variant="secondary"
              className="rounded-ds-xl w-full"
            >
              <span className="inline-flex items-center gap-3">
                <i className="fab fa-facebook-f text-xl" aria-hidden />
                {busy === 'facebook' ? 'Opening Facebook…' : 'Continue with Facebook'}
              </span>
            </Button>

            <Button asChild variant="secondary" className="rounded-ds-xl w-full">
              <Link
                href={`/login/email${selectedRole ? `?role=${selectedRole}` : ''}`}
                aria-label="Sign in with Email and Password"
              >
                <span className="inline-flex items-center gap-3">
                  <i className="fas fa-envelope text-xl" aria-hidden />
                  Email (Password)
                </span>
              </Link>
            </Button>

            <Button asChild variant="secondary" className="rounded-ds-xl w-full">
              <Link
                href={`/login/phone${selectedRole ? `?role=${selectedRole}` : ''}`}
                aria-label="Sign in with Phone OTP"
              >
                <span className="inline-flex items-center gap-3">
                  <i className="fas fa-sms text-xl" aria-hidden />
                  Phone (OTP)
                </span>
              </Link>
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
