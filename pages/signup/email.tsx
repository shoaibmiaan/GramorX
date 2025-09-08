'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
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
  const [referral, setReferral] = React.useState(ref);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [emailExists, setEmailExists] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setEmailExists(false);

    try {
      setBusy(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify?email=${encodeURIComponent(
            email
          )}${ref ? `&ref=${encodeURIComponent(ref)}` : ''}`,
          data: referral ? { referral_code: referral } : undefined,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          setEmailExists(true);
          setErr('This email is already registered.');
        } else {
          setErr(error.message);
        }
        return;
      }

      if (data?.user) setSuccess(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SectionLabel>Sign up with Email</SectionLabel>
      <Card className="p-6 rounded-ds-2xl card-surface">
        {err && (
          <Alert variant="error" title="Error" className="mb-3">
            {err}{' '}
            {emailExists && (
              <span className="block mt-1">
                <Link href={`/login${ref ? `?ref=${ref}` : ''}`} className="underline text-primary">
                  Log in instead
                </Link>{' '}
                or{' '}
                <Link href="/auth/reset" className="underline text-primary">
                  reset password
                </Link>.
              </span>
            )}
          </Alert>
        )}

        {success ? (
          <Alert variant="success" title="Check your email">
            We’ve sent a confirmation link to <b>{email}</b>.
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
            <Input
              label="Referral code (optional)"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
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
