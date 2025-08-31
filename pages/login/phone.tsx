import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthSidePanel from '@/components/layouts/AuthSidePanel';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';
import { isValidE164Phone } from '@/utils/validation';
import { getAuthErrorMessage } from '@/lib/authErrors';

export default function LoginWithPhone() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'request' | 'verify'>('request');
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const MAX_RESENDS = Number(process.env.NEXT_PUBLIC_MAX_RESEND_ATTEMPTS ?? 3);
  const RESEND_COOLDOWN = Number(process.env.NEXT_PUBLIC_RESEND_COOLDOWN ?? 30);

  const useSafeEffect = typeof React.useEffect === 'function' ? React.useEffect : () => {};
  useSafeEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const trimmedPhone = phone.trim();
    if (!isValidE164Phone(trimmedPhone)) {
      setPhoneErr('Enter your phone number in E.164 format, e.g. +923001234567');
      return;
    }
    setPhoneErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: trimmedPhone,
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) return setErr(getAuthErrorMessage(error));
    setResendAttempts(0);
    setCooldown(RESEND_COOLDOWN);
    setStage('verify');
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!code) return setErr('Enter the 6-digit code.');

    const trimmedPhone = phone.trim();
    setLoading(true);
    // @ts-expect-error `token` is supported for verification
    const { data, error } = await supabase.auth.signInWithOtp({ phone: trimmedPhone, token: code });
    setLoading(false);
    if (error) return setErr(getAuthErrorMessage(error));

    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      try { await supabase.auth.updateUser({ data: { status: 'active' } }); } catch {}
      try { await fetch('/api/auth/login-event', { method: 'POST' }); } catch {}
      redirectByRole(data.session.user);
    }
  }

  async function resendOtp() {
    if (resendAttempts >= MAX_RESENDS || cooldown > 0) return;
    setErr(null);
    setResending(true);
    setLoading(true);
    try {
      const trimmedPhone = phone.trim();
      const { error } = await supabase.auth.signInWithOtp({
        phone: trimmedPhone,
        options: { shouldCreateUser: false },
      });
      if (error) return setErr(getAuthErrorMessage(error));
      setResendAttempts((a) => a + 1);
      setCooldown(RESEND_COOLDOWN);
      try {
        await fetch('/api/auth/otp-limit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: trimmedPhone }),
        });
      } catch {}
    } finally {
      setLoading(false);
      setResending(false);
    }
  }

  const RightPanel = (
    <AuthSidePanel
      title="Phone sign-in"
      description="Use a one-time SMS code to sign in."
      footerLink={
        <>
          Prefer email?{' '}
          <Link href="/login/email" className="text-primary hover:underline">
            Use email &amp; password
          </Link>
        </>
      }
    />
  );

  return (
    <AuthLayout title="Phone Verification" subtitle="Sign in with an SMS code." right={RightPanel}>
      {err && <Alert variant="error" title="Error" className="mb-4">{err}</Alert>}

      {stage === 'request' ? (
        <form onSubmit={requestOtp} className="space-y-6 mt-2">
          <Input
            label="Phone number"
            type="tel"
            placeholder="+923001234567"
            value={phone}
            onChange={(e) => {
              const v = e.target.value;
              setPhone(v);
              setPhoneErr(!v || isValidE164Phone(v.trim()) ? null : 'Enter your phone number in E.164 format, e.g. +923001234567');
            }}
            required
            hint="Use E.164 format, e.g. +923001234567"
            error={phoneErr ?? undefined}
          />
          <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
            {loading ? 'Sending…' : 'Send code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-6 mt-2">
          <Input
            label="Verification code"
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e)=>setCode(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full rounded-ds-xl"
            disabled={loading && !resending}
          >
            {loading && !resending ? 'Verifying…' : 'Verify & Continue'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-ds-xl"
            onClick={resendOtp}
            disabled={loading || cooldown > 0 || resendAttempts >= MAX_RESENDS}
          >
            {loading && resending
              ? 'Resending…'
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : resendAttempts >= MAX_RESENDS
                  ? 'Resend limit reached'
                  : `Resend code (${MAX_RESENDS - resendAttempts} left)`}
          </Button>
          <p className="text-small text-grayish dark:text-gray-400 text-center">
            {resendAttempts >= MAX_RESENDS
              ? 'No resend attempts left.'
              : cooldown > 0
                ? `You can resend the code in ${cooldown}s.`
                : `${MAX_RESENDS - resendAttempts} resend attempts remaining.`}
          </p>
        </form>
      )}

      <Button asChild variant="secondary" className="mt-6 rounded-ds-xl w-full">
        <Link href="/login">Back to Login Options</Link>
      </Button>
    </AuthLayout>
  );
}
