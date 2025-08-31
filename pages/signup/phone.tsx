import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthSidePanel from '@/components/layouts/AuthSidePanel';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Alert } from '@/components/design-system/Alert';
import { Select } from '@/components/design-system/Select';
import { SmsIcon, ShieldIcon } from '@/components/design-system/icons';

type Role = 'student' | 'teacher' | 'admin' | '';

const MAX_RESENDS = 3;
const RESEND_COOLDOWN = 30;

export default function SignupPhone() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('');
  const [step, setStep] = useState<'enter' | 'verify'>('enter');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const qRole = (router.query.role as Role) ?? '';
    if (qRole && qRole !== role) setRole(qRole);
  }, [router.query.role, role]);

  const roleQuery = useMemo(
    () => (role ? `?role=${encodeURIComponent(role)}` : ''),
    [role]
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function sendOtp() {
    try {
      setErr(null);
      setSending(true);
      const r = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'signup' }),
      });
      if (!r.ok) throw new Error('Failed to send code');
      setStep('verify');
      setCooldown(RESEND_COOLDOWN);
    } catch (e: any) {
      setErr(e?.message || 'Could not send code. Check your number.');
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp() {
    try {
      setErr(null);
      setVerifying(true);
      const r = await fetch('/api/check-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, purpose: 'signup' }),
      });
      if (!r.ok) throw new Error('Invalid or expired code');
      const next = `/dashboard${roleQuery}`;
      router.replace(next);
    } catch (e: any) {
      setErr(e?.message || 'Verification failed. Try again.');
    } finally {
      setVerifying(false);
    }
  }

  function onResend() {
    if (resendAttempts >= MAX_RESENDS || cooldown > 0) return;
    setResendAttempts((x) => x + 1);
    setCooldown(RESEND_COOLDOWN);
    sendOtp();
  }

  return (
    <AuthLayout
      title="Sign up with Phone"
      description="We’ll text you a one-time code."
      sidePanel={
        <AuthSidePanel
          title="Quick access"
          items={[
            { icon: SmsIcon, label: 'OTP via SMS' },
            { icon: ShieldIcon, label: 'Account protection' },
          ]}
        />
      }
    >
      <Head>
        <title>Phone Signup — GramorX</title>
      </Head>

      {err && <Alert variant="error" className="mb-4">{err}</Alert>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Create as</label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as Role)}
            placeholder="Select your role"
            options={[
              { label: 'Student', value: 'student' },
              { label: 'Teacher', value: 'teacher' },
              { label: 'Admin', value: 'admin' },
            ]}
          />
        </div>

        {step === 'enter' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!phone) return setErr('Enter your phone number.');
              sendOtp();
            }}
            className="space-y-4"
          >
            <Input
              label="Phone"
              placeholder="+92XXXXXXXXXX"
              value={phone}
              onChange={(e: any) => setPhone(e.target.value)}
              leftIcon={<SmsIcon className="h-4 w-4" />}
            />
            <Button
              type="submit"
              variant="primary"
              className="rounded-ds-xl"
              fullWidth
              disabled={sending}
            >
              {sending ? 'Sending code…' : 'Send code'}
            </Button>

            <Button asChild variant="ghost" className="rounded-ds-xl" fullWidth>
              <Link href={`/signup${roleQuery}`}>Back to Sign-up Options</Link>
            </Button>
          </form>
        )}

        {step === 'verify' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!code) return setErr('Enter the 6-digit code.');
              verifyOtp();
            }}
            className="space-y-4"
          >
            <Input
              label="6-digit code"
              placeholder="••••••"
              value={code}
              onChange={(e: any) => setCode(e.target.value)}
            />

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                className="rounded-ds-xl grow"
                disabled={verifying}
              >
                {verifying ? 'Verifying…' : 'Verify & create account'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="rounded-ds-xl"
                onClick={onResend}
                disabled={cooldown > 0 || resendAttempts >= MAX_RESENDS}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {resendAttempts >= MAX_RESENDS
                ? 'No resend attempts left.'
                : cooldown > 0
                ? `You can resend the code in ${cooldown}s.`
                : `${MAX_RESENDS - resendAttempts} resend attempts remaining.`}
            </p>

            <Button asChild variant="ghost" className="rounded-ds-xl" fullWidth>
              <Link href={`/signup${roleQuery}`}>Back to Sign-up Options</Link>
            </Button>
          </form>
        )}
      </div>

      <div className="mt-8 text-xs text-muted-foreground">
        <Link href="/terms" className="underline underline-offset-4 hover:no-underline">
          Terms
        </Link>
        <span className="px-2">•</span>
        <Link href="/privacy" className="underline underline-offset-4 hover:no-underline">
          Privacy
        </Link>
      </div>
    </AuthLayout>
  );
}
