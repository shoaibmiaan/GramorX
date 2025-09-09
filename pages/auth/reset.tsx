'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { Badge } from '@/components/design-system/Badge';
import {
  AppleIcon,
  GoogleIcon,
  FacebookIcon,
  MailIcon,
  SmsIcon,
} from '@/components/design-system/icons';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { destinationByRole } from '@/lib/routeAccess';
import { Input } from '@/components/design-system/Input';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-sm uppercase tracking-wide text-mutedText">
      {children}
    </div>
  );
}
function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

export default function ResetPasswordPage() {
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'verify' | 'update'>('verify');

  // verify inputs
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  // update inputs
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const router = useRouter();

  // Session check → if arrived via email link, Supabase creates a session → jump to update
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) setStep('update');
      setReady(true);
    })();
    return () => { mounted = false; };
  }, []);

  // Persist role in query + localStorage (same as LoginOptions)
  useEffect(() => {
    if (!router.isReady) return;
    const roleQuery = typeof router.query.role === 'string' ? router.query.role : null;

    if (roleQuery) {
      setSelectedRole(roleQuery);
      if (typeof window !== 'undefined') localStorage.setItem('selectedRole', roleQuery);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedRole');
      if (stored) {
        setSelectedRole(stored);
        router.replace(
          { pathname: router.pathname, query: { ...router.query, role: stored } },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [router]);

  async function verifyWithCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(null);

    if (!email) return setErr('Enter your email.');
    if (!/^\d{6}$/.test(code)) return setErr('Enter the 6-digit code from the email.');

    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
      if (error) throw error;
      setOk('Email verified. You can now set a new password.');
      setStep('update');
    } catch (e: any) {
      setErr(e?.message || 'Code verification failed.');
    } finally {
      setBusy(false);
    }
  }

  async function updatePwd(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(null);

    if (!password) return setErr('Please enter a new password.');
    if (password !== confirm) return setErr('Passwords do not match.');

    setBusy(true);
    try {
      // Optional RPC; ignore if missing
      try {
        const { data: reused } = await supabase.rpc('password_is_reused', { new_password: password });
        if (reused) return setErr('Please choose a password you have not used before.');
      } catch {}

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setOk('Password updated. Redirecting to sign in…');
      const next = `/login${selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : ''}`;
      setTimeout(() => router.replace(next), 900);
    } catch (e: any) {
      setErr(e?.message || 'Failed to update password.');
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <div className="p-6 text-mutedText" aria-live="polite">Preparing reset flow…</div>;
  }

  return (
    <>
      <SectionLabel>Reset password</SectionLabel>

      {/* Tabs (kept minimal to match your compact pattern) */}
      <div className="mb-4 grid grid-cols-2 rounded-ds overflow-hidden border border-border">
        <button
          type="button"
          className={cls('py-2 text-sm', step === 'verify' ? 'bg-card text-card-foreground' : 'bg-background')}
          onClick={() => setStep('verify')}
        >
          Enter code
        </button>
        <button
          type="button"
          className={cls('py-2 text-sm', step === 'update' ? 'bg-card text-card-foreground' : 'bg-background')}
          onClick={() => setStep('update')}
        >
          I used the link
        </button>
      </div>

      {err && (
        <Alert variant="error" title="Error" className="mb-4" role="status" aria-live="assertive">
          {err}
        </Alert>
      )}
      {ok && (
        <Alert variant="success" title="Success" className="mb-4" role="status" aria-live="polite">
          {ok}
        </Alert>
      )}

      {step === 'verify' ? (
        <>
          <div className="mb-2">
            <Badge variant="info" size="sm">Use the 6-digit code</Badge>
          </div>
          <form onSubmit={verifyWithCode} className="grid gap-3">
            <Input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="Email used for your account"
              required
            />
            <Input
              type="text"
              value={code}
              onChange={(e)=>setCode(e.target.value.replace(/\s+/g, ''))}
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              required
            />
            <Button type="submit" loading={busy} loadingText="Verifying…" leadingIcon={<SmsIcon className="h-5 w-5" />}>
              Verify code
            </Button>
            <div className="text-sm text-mutedText">
              Didn’t get it?{' '}
              <Link
                href={`/auth/forgot${selectedRole ? `?role=${selectedRole}` : ''}`}
                className="underline"
              >
                Resend email
              </Link>.
            </div>
          </form>
        </>
      ) : (
        <form onSubmit={updatePwd} className="grid gap-3">
          <Input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="New password"
            required
          />
          <Input
            type="password"
            value={confirm}
            onChange={(e)=>setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
          />
          <Button type="submit" loading={busy} loadingText="Updating…" leadingIcon={<MailIcon className="h-5 w-5" />}>
            Update password
          </Button>
          <div className="text-sm text-mutedText">
            Back to{' '}
            <Link
              href={`/login${selectedRole ? `?role=${selectedRole}` : ''}`}
              className="underline"
            >
              Sign in
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
