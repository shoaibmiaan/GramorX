import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
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
    <div className="h-full flex flex-col justify-between p-8 md:p-12 bg-gradient-to-br from-purpleVibe/10 via-electricBlue/5 to-neonGreen/10 dark:from-dark/50 dark:via-dark/30 dark:to-darker/60">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Image src="/brand/logo.png" alt="GramorX" width={40} height={40} className="rounded-ds object-contain" priority />
          <h2 className="font-slab text-h2 text-gradient-primary">Email sign-up</h2>
        </div>
        <p className="text-body text-grayish dark:text-gray-300 max-w-md">
          Create your account using email & password.
        </p>
      </div>
      <div className="pt-8 text-small text-grayish dark:text-gray-400">
        Prefer phone?{' '}
        <Link href="/signup/phone" className="text-primaryDark hover:underline">
          Use Phone (OTP)
        </Link>
      </div>
    </div>
  );

  return (
    <AuthLayout
      title="Sign up with Email"
      subtitle="Create an account using email & password."
      right={RightPanel}
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
