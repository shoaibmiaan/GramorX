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

export default function ForgotPasswordPage() {
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<React.ReactNode>(null);
  const [busy, setBusy] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();

  // Only redirect away if we DEFINITELY have a session (same pattern)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session) {
        const rawNext = typeof router.query.next === 'string' ? router.query.next : '';
        const safe =
          rawNext && !rawNext.startsWith('http') && rawNext !== '/login'
            ? rawNext
            : destinationByRole(session.user);
        if (router.asPath !== safe) {
          await router.replace(safe);
          return;
        }
      }
      setReady(true);
    })();
    return () => { mounted = false; };
  }, [router.query.next, router.asPath, router.replace]);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(null);
    if (!email) return setErr('Please enter your email.');
    setBusy(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const next = `/login${selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : ''}`;
      const redirectTo = `${origin}/auth/reset?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;

      setOk(
        <>
          We’ve sent a reset email to <span className="font-medium">{email}</span>. You can use the
          link, or enter the <span className="font-medium">6-digit code</span> on{' '}
          <Link
            href={`/auth/reset${selectedRole ? `?role=${selectedRole}` : ''}`}
            className="underline"
          >
            the reset page
          </Link>.
        </>
      );
    } catch (e: any) {
      setErr(e?.message || 'Failed to send reset email.');
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <div className="p-6 text-mutedText" aria-live="polite">Checking session… Please wait.</div>;
  }

  return (
    <>
      <SectionLabel>Forgot password</SectionLabel>

      {err && (
        <Alert variant="error" title="Error" className="mb-4" role="status" aria-live="assertive">
          {err}
        </Alert>
      )}
      {ok && (
        <Alert variant="success" title="Email sent" className="mb-4" role="status" aria-live="polite">
          {ok}
        </Alert>
      )}

      <div className="mb-2">
        <Badge variant="info" size="sm">Code option available</Badge>
      </div>

      <form onSubmit={submit} className="grid gap-3">
        <Input
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email"
          required
        />
        <Button type="submit" loading={busy} loadingText="Sending…" leadingIcon={<MailIcon className="h-5 w-5" />}>
          Send reset email
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-mutedText">
        <div>
          Already have the code?{' '}
          <Link
            href={`/auth/reset${selectedRole ? `?role=${selectedRole}` : ''}`}
            className="text-primary hover:underline hover:text-primary/80 transition"
          >
            Enter code
          </Link>
        </div>
        <Link
          href={`/login${selectedRole ? `?role=${selectedRole}` : ''}`}
          className="text-primary hover:underline hover:text-primary/80 transition"
        >
          Back to sign in
        </Link>
      </div>
    </>
  );
}
