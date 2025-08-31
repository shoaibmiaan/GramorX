import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthSidePanel from '@/components/layouts/AuthSidePanel';
import { Input } from '@/components/design-system/Input';
import { PasswordInput } from '@/components/design-system/PasswordInput';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { isValidEmail } from '@/utils/validation';

export default function SignupWithPassword() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [referral, setReferral] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof router.query.ref === 'string') {
      setReferral(router.query.ref);
    }
  }, [router.query.ref]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !pw) {
      setErr('Please fill in all fields.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailErr('Enter a valid email address.');
      return;
    }
    setEmailErr(null);

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password: pw,
          referral,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErr(data.error || 'Something went wrong. Please try again.');
        return;
      }

      const session = data.session;
      if (referral && session?.access_token) {
        try {
          await fetch('/api/referrals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ code: referral.trim() }),
          });
        } catch {
          // ignore
        }
      }

      if (typeof window !== 'undefined') {
        window.location.assign(`/auth/verify?email=${encodeURIComponent(trimmedEmail)}`);
      }
    } catch (e: any) {
      setLoading(false);
      setErr(e?.message || 'Something went wrong. Please try again.');
    }
  }

  const RightPanel = (
    <AuthSidePanel
      title="Create your account"
      description="Use your email & password to get started."
      footerLink={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primaryDark hover:underline">
            Log in
          </Link>
        </>
      }
    />
  );

  return (
    <AuthLayout
      title="Sign up with Email"
      subtitle="Create an account using email & password."
      right={RightPanel}
      showRightOnMobile
    >
      {err && (
        <Alert variant="error" title="Error" className="mb-4">
          {err === 'user_exists' ? (
            <>
              Account already exists. Try{' '}
              <Link href="/login" className="underline">
                logging in
              </Link>
              .
            </>
          ) : (
            err
          )}
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-6 mt-2">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            const v = e.target.value;
            setEmail(v);
            setEmailErr(!v || isValidEmail(v.trim()) ? null : 'Enter a valid email address.');
          }}
          autoComplete="email"
          required
          error={emailErr ?? undefined}
        />
        <PasswordInput
          label="Password"
          placeholder="Create a password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="new-password"
          required
          hint="At least 8 characters, including letters and numbers"
        />
        <Input
          label="Referral code (optional)"
          value={referral}
          onChange={(e) => setReferral(e.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          className="rounded-ds-xl"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button asChild variant="secondary" className="rounded-ds-xl" fullWidth>
          <Link href="/signup">Back to Sign-up Options</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-ds-xl" fullWidth>
          <Link href="/login">Already have an account? Log in</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
