import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabase } from '@/lib/supabaseClient';

export default function PhoneLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState(''), [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false), [err, setErr] = useState<string|null>(null);

  const send = async () => {
    setErr(null);
    if (!phone) return setErr('Enter your phone number with country code.');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { channel: 'sms' } });
    setLoading(false);
    if (error) return setErr(error.message);
    setSent(true);
  };

  const verify = async () => {
    setErr(null);
    if (!otp) return setErr('Enter the verification code.');
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push('/dashboard');
  };

  return (
    <section className="min-h-[100svh] bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="min-h-[100svh] grid place-items-center">
          <Card className="w-full max-w-md p-8 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-4">
              <a href="/login" className="text-small text-primary dark:text-electricBlue">&larr; Back</a>
              <Image src="/brand/logo.png" alt="Brand Logo" width={110} height={26} className="h-6 w-auto" />
            </div>

            <h1 className="font-slab text-h1 mb-2 text-primary dark:text-electricBlue">Sign in with Phone</h1>
            <p className="text-grayish dark:text-white/75 mb-6">
              We’ll send a one‑time code to your number.
            </p>

            {err && <Alert variant="error" title="Verification issue" className="mb-4">{err}</Alert>}

            {!sent ? (
              <div className="grid gap-4">
                <Input label="Phone number" type="tel" placeholder="+92 300 1234567"
                       value={phone} onChange={(e)=>setPhone(e.target.value)}
                       hint="Include country code (e.g., +92 for Pakistan)" />
                <Button variant="accent" className="w-full rounded-ds-xl" onClick={send} disabled={loading}>
                  {loading ? 'Sending code…' : 'Send verification code'}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                <Input label="Verification code" inputMode="numeric" placeholder="Enter 6‑digit code"
                       value={otp} onChange={(e)=>setOtp(e.target.value)} />
                <div className="flex gap-3">
                  <Button variant="primary" className="flex-1 rounded-ds-xl" onClick={verify} disabled={loading}>
                    {loading ? 'Verifying…' : 'Verify & Continue'}
                  </Button>
                  <Button variant="secondary" className="rounded-ds-xl" onClick={send} disabled={loading}>
                    Resend
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </Container>
    </section>
  );
}
