import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';
import { isValidE164Phone } from '@/utils/validation';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { useAsyncAction } from '@/hooks/useAsyncAction';

export default function LoginWithPhone() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'request' | 'verify'>('request');
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const [resendAttempts, setResendAttempts] = useState(0);

  const [requestOtp, requesting] = useAsyncAction(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    if (!isValidE164Phone(trimmedPhone)) {
      setPhoneErr('Enter your phone number in E.164 format, e.g. +923001234567');
      return;
    }
    setPhoneErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      phone: trimmedPhone,
      options: { shouldCreateUser: false },
    });
    if (error) throw new Error(getAuthErrorMessage(error));
    setResendAttempts(0);
    setStage('verify');
  }, { error: 'Could not send code' });

  const [verifyOtp, verifying] = useAsyncAction(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) throw new Error('Enter the 6-digit code.');

    const trimmedPhone = phone.trim();
    // @ts-expect-error `token` is supported for verification
    const { data, error } = await supabase.auth.signInWithOtp({ phone: trimmedPhone, token: code });
    if (error) throw new Error(getAuthErrorMessage(error));

    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      try { await supabase.auth.updateUser({ data: { status: 'active' } }); } catch {}
      try { await fetch('/api/auth/login-event', { method: 'POST' }); } catch {}
      redirectByRole(data.session.user);
    }
  }, { error: 'Could not verify code' });

  const [resendOtp, resending] = useAsyncAction(async () => {
    const trimmedPhone = phone.trim();
    const { error } = await supabase.auth.signInWithOtp({
      phone: trimmedPhone,
      options: { shouldCreateUser: false },
    });
    if (error) throw new Error(getAuthErrorMessage(error));
    setResendAttempts((a) => a + 1);
  }, { error: 'Could not resend code', success: 'Code resent' });

  const RightPanel = (
    <div className="h-full flex flex-col justify-between p-8 md:p-12 bg-gradient-to-br from-purpleVibe/10 via-electricBlue/5 to-neonGreen/10 dark:from-dark/50 dark:via-dark/30 dark:to-darker/60">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Image src="/brand/logo.png" alt="GramorX" width={40} height={40} className="rounded-ds object-contain" priority />
          <h2 className="font-slab text-h2 text-gradient-primary">Phone sign-in</h2>
        </div>
        <p className="text-body text-grayish dark:text-gray-300 max-w-md">Use a one-time SMS code to sign in.</p>
      </div>
      <div className="pt-8 text-small text-grayish dark:text-gray-400">
        Prefer email? <Link href="/login/email" className="text-primary hover:underline">Use email &amp; password</Link>
      </div>
    </div>
  );

  return (
    <AuthLayout title="Phone Verification" subtitle="Sign in with an SMS code." right={RightPanel}>
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
          <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={requesting}>
            {requesting ? 'Sending…' : 'Send code'}
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
            disabled={verifying}
          >
            {verifying ? 'Verifying…' : 'Verify & Continue'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-ds-xl"
            onClick={resendOtp}
            disabled={resending}
          >
            {resending ? 'Resending…' : `Resend code${resendAttempts ? ` (${resendAttempts})` : ''}`}
          </Button>
        </form>
      )}

      <Button asChild variant="secondary" className="mt-6 rounded-ds-xl w-full">
        <Link href="/login">Back to Login Options</Link>
      </Button>
    </AuthLayout>
  );
}
