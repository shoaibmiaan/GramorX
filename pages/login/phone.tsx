import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function LoginWithPhone() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'request' | 'verify'>('request');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!phone) return setErr('Enter your phone number in E.164 format, e.g. +923001234567');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
    setLoading(false);
    if (error) return setErr(error.message);
    setStage('verify');
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!code) return setErr('Enter the 6-digit code.');
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
    setLoading(false);
    if (error) return setErr(error.message);
    if (data.session) window.location.assign('/dashboard');
  }

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
        Prefer email? <Link href="/login/email" className="text-primary hover:underline">Use email & password</Link>
      </div>
    </div>
  );

  return (
    <AuthLayout title="Phone Verification" subtitle="Sign in with an SMS code."
      // @ts-expect-error TODO: AuthLayout supports an optional `right` slot
      right={RightPanel}
    >
      {err && <Alert variant="error" title="Error" className="mb-4">{err}</Alert>}

      {stage === 'request' ? (
        <form onSubmit={requestOtp} className="space-y-6 mt-2">
          <Input label="Phone number" type="tel" placeholder="+923001234567" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
          <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
            {loading ? 'Sending…' : 'Send code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-6 mt-2">
          <Input label="Verification code" inputMode="numeric" placeholder="123456" value={code} onChange={(e)=>setCode(e.target.value)} required />
          <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </Button>
        </form>
      )}

      <Button asChild variant="secondary" className="mt-6 rounded-ds-xl w-full">
        <Link href="/login">Back to Login Options</Link>
      </Button>
    </AuthLayout>
  );
}
