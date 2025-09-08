'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { PasswordInput } from '@/components/design-system/PasswordInput';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-sm uppercase tracking-wide text-mutedText">{children}</div>
  );
}

export default function SignupEmailPage() {
  const router = useRouter();
  const ref = typeof router.query.ref === 'string' ? router.query.ref : '';

  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      setBusy(true);
      // Use our API so we get consistent 'user_exists' handling across flows.
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: pw,
          referral: ref || '',
        }),
      });

      const data = await res.json().catch(() => ({} as any));
      setBusy(false);

      if (!res.ok) {
        // Map duplicate case to friendly message, do NOT show success UI.
        if (data?.error === 'user_exists') {
          setErr('This email is already registered. You can log in or reset your password.');
          return;
        }
        setErr(data?.error || 'Something went wrong. Please try again.');
        return;
      }

      // Success → show verify message (don’t auto-redirect)
      setSuccess(true);
    } catch (e: any) {
      setBusy(false);
      setErr(e?.message || 'Network error. Please try again.');
    }
  }

  return (
    <>
      <SectionLabel>Sign up with Email</SectionLabel>
      <Card className="p-6 rounded-ds-2xl card-surface">
        {err && (
          <Alert tone="danger" className="mb-3">
            {err}{' '}
            <span className="block mt-1">
              <Link href={`/login${ref ? `?ref=${ref}` : ''}`} className="underline text-primary">
                Log in
              </Link>{' '}
              or{' '}
              <Link href="/auth/reset" className="underline text-primary">
                reset password
              </Link>.
            </span>
          </Alert>
        )}

        {success ? (
          <Alert tone="success">
            We’ve sent a confirmation link to <b>{email}</b>. Please verify your email to continue.
          </Alert>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <PasswordInput
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full rounded-ds-xl"
              disabled={busy}
            >
              {busy ? 'Creating…' : 'Create Account'}
            </Button>
          </form>
        )}
      </Card>
    </>
  );
}
