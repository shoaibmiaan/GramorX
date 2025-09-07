'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
        const msg =
          typeof body.error === 'string'
            ? body.error
            : getAuthErrorMessage(body.error) ?? 'Unable to sign in. Please try again.';
        setErr(msg);
        return;
      }

      await supabase.auth.setSession({
        access_token: body.session.access_token,
        refresh_token: body.session.refresh_token,
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const challenged = await createChallenge(user);
      if (challenged) return;

      try {
        await fetch('/api/auth/login-event', { method: 'POST' });
      } catch {}
      redirectByRole(body.session.user);
    } catch {
      setLoading(false);
      setErr('Unable to sign in. Please try again.');
    }
  }

  return (
    <>
      {(err || mfaErr) && (
        <Alert variant="error" title="Error" className="mb-4">
          {err || mfaErr}
        </Alert>
      )}

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
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" variant="primary" className="rounded-ds-xl" fullWidth disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          <Button asChild variant="link" className="mt-2" fullWidth>
            <Link href="/forgot-password">Forgot password?</Link>
          </Button>
          <p className="mt-2 text-xs text-mutedText text-center">
            By continuing you agree to our <Link href="/legal/terms" className="underline">Terms</Link> &amp; <Link href="/legal/privacy" className="underline">Privacy</Link>.
          </p>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-6 mt-2 max-w-xs">
          <Input
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            autoComplete="one-time-code"
            placeholder="6-digit code"
            required
          />
          <Button type="submit" variant="primary" className="rounded-ds-xl" fullWidth disabled={verifying}>
            {verifying ? 'Verifying…' : 'Verify & Sign in'}
          </Button>
        </form>
      )}

      <Button asChild variant="secondary" className="mt-6 rounded-ds-xl" fullWidth>
        <Link href="/login">Back to Login Options</Link>
      </Button>
    </>
  );
}
