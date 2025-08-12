import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { ThemeToggle } from '@/components/design-system/ThemeToggle';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function LoginWithPhone() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'request' | 'verify'>('request');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!phone) return setErr('Enter your phone number in E.164 format, e.g. +923001234567');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) return setErr(error.message);
    setStage('verify');
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!code) return setErr('Enter the 6-digit code.');
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
    setLoading(false);
    if (error) return setErr(error.message);
    if (data.session) router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <ThemeToggle className="absolute top-4 right-4" />
      <Container className="max-w-md w-full">
        <h1 className="font-slab text-h2 text-gradient-primary">Phone Verification</h1>
        <p className="text-grayish mt-1">Sign in with an SMS code.</p>

        {err && <Alert variant="error" title="Error" className="mt-4">{err}</Alert>}

        {stage === 'request' ? (
          <form onSubmit={requestOtp} className="space-y-6 mt-6">
            <Input label="Phone number" type="tel" placeholder="+923001234567" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
            <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
              {loading ? 'Sending…' : 'Send code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-6 mt-6">
            <Input label="Verification code" inputMode="numeric" placeholder="123456" value={code} onChange={(e)=>setCode(e.target.value)} required />
            <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </Button>
          </form>
        )}

        <Button as="button" onClick={() => router.push('/login')} variant="secondary" className="mt-6 rounded-ds-xl w-full">
          Back to Login
        </Button>
      </Container>
    </div>
  );
}
