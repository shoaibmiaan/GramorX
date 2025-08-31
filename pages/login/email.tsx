import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Input } from '@/components/design-system/Input';
import { PasswordInput } from '@/components/design-system/PasswordInput';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';
import { isValidEmail } from '@/utils/validation';
import { getAuthErrorMessage } from '@/lib/authErrors';
import useEmailLoginMFA from '@/hooks/useEmailLoginMFA';

export default function LoginWithEmail() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    otp,
    setOtp,
    otpSent,
    createChallenge,
    verifyOtp,
    verifying,
    error: mfaErr,
    setError: setMfaErr,
  } = useEmailLoginMFA();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMfaErr(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !pw) {
      setErr('Email and password are required.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setEmailErr('Enter a valid email address.');
      return;
    }
    setEmailErr(null);

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: pw }),
      });
      const body = await res.json().catch(() => ({}));
      setLoading(false);

      if (!res.ok || !body.session) {
        const msg = typeof body.error === 'string' ? body.error : 'Unable to sign in. Please try again.';
        setErr(msg);
        return;
      }

      await supabase.auth.setSession({
        access_token: body.session.access_token,
        refresh_token: body.session.refresh_token,
      });

      const { data: { user } } = await supabase.auth.getUser();
      const challenged = await createChallenge(user);
      if (challenged) return;

      try { await fetch('/api/auth/login-event', { method: 'POST' }); } catch {}
      redirectByRole(body.session.user);
    } catch (e) {
      setLoading(false);
      setErr('Unable to sign in. Please try again.');
    }
  }

  const RightPanel = (
    <div className="h-full flex flex-col justify-between p-8 md:p-12 bg-gradient-to-br from-purpleVibe/10 via-electricBlue/5 to-neonGreen/10 dark:from-dark/50 dark:via-dark/30 dark:to-darker/60">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Image src="/brand/logo.png" alt="GramorX" width={40} height={40} className="rounded-ds object-contain" priority />
          <h2 className="font-slab text-h2 text-gradient-primary">Sign in to GramorX</h2>
        </div>
        <p className="text-body text-grayish dark:text-gray-300 max-w-md">
          Access all IELTS modules with progress tracking & AI feedback.
        </p>
      </div>
      <div className="pt-8 text-small text-grayish dark:text-gray-400">
        New here? <Link href="/signup" className="text-primaryDark hover:underline">Create an account</Link>
      </div>
    </div>
  );

  return (
    <AuthLayout title="Sign in with Email" subtitle="Use your email & password." right={RightPanel}>
      {(err || mfaErr) && <Alert variant="error" title="Error">{err || mfaErr}</Alert>}

      {!otpSent ? (
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
            placeholder="Your password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" variant="primary" className="rounded-ds-xl" fullWidth disabled={loading}>
            {loading ? 'Signing in…' : 'Continue'}
          </Button>
          <Button asChild variant="secondary" className="mt-4 rounded-ds-xl" fullWidth>
            <Link href="/forgot-password">Forgot password?</Link>
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-6 mt-2 max-w-xs">
          <Input label="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} autoComplete="one-time-code" placeholder="6-digit code" required />
          <Button type="submit" variant="primary" className="rounded-ds-xl" fullWidth disabled={verifying}>
            {verifying ? 'Verifying…' : 'Verify'}
          </Button>
        </form>
      )}

      <Button asChild variant="secondary" className="mt-6 rounded-ds-xl" fullWidth>
        <Link href="/login">Back to Login Options</Link>
      </Button>
    </AuthLayout>
  );
}
