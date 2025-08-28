import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Input } from '@/components/design-system/Input';
import { PasswordInput } from '@/components/design-system/PasswordInput';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';
import SessionDialog, { SessionInfo } from '@/components/auth/SessionDialog';
import type { User } from '@supabase/supabase-js';

export default function LoginWithPassword() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [redirectUser, setRedirectUser] = useState<User | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email || !pw) return setErr('Please fill in all fields.');
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) return setErr(error.message);
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      try {
        await fetch('/api/auth/login-event', { method: 'POST' });
      } catch (err) {
        console.error(err);
      }
      const user = data.session.user;
      setRedirectUser(user);
      try {
        const r = await fetch('/api/auth/sessions');
        const list: SessionInfo[] = await r.json();
        if (Array.isArray(list) && list.length > 1) {
          setSessions(list.slice(1));
          return;
        }
      } catch (err) {
        console.error(err);
      }
      redirectByRole(user);
    }
  }

  function closeSessions() {
    if (redirectUser) redirectByRole(redirectUser);
  }

  async function keepOnlyHere() {
    if (sessions) {
      await Promise.all(
        sessions.map((s) => fetch(`/api/auth/sessions/${s.id}`, { method: 'DELETE' }))
      );
    }
    closeSessions();
  }

  const RightPanel = (
    <div className="h-full flex flex-col justify-between p-8 md:p-12 bg-gradient-to-br from-purpleVibe/10 via-electricBlue/5 to-neonGreen/10 dark:from-dark/50 dark:via-dark/30 dark:to-darker/60">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Image src="/brand/logo.png" alt="GramorX" width={40} height={40} className="rounded-ds object-contain" priority />
          <h2 className="font-slab text-h2 text-gradient-primary">Welcome back</h2>
        </div>
        <p className="text-body text-grayish dark:text-gray-300 max-w-md">
          Continue where you left off across Listening, Reading, Writing & Speaking.
        </p>
      </div>
      <div className="pt-8 text-small text-grayish dark:text-gray-400">
        Need an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
      </div>
    </div>
  );

  return (
    <AuthLayout title="Sign in with Email" subtitle="Use your email & password." right={RightPanel}>
      {err && <Alert variant="error" title="Error" className="mb-4">{err}</Alert>}
      <form onSubmit={onSubmit} className="space-y-6 mt-2">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="current-password"
          required
        />
        <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
          {loading ? 'Signing in…' : 'Continue'}
        </Button>
      </form>
      <Button asChild variant="secondary" className="mt-6 rounded-ds-xl w-full">
        <Link href="/login">Back to Login Options</Link>
      </Button>
      {sessions && (
        <SessionDialog
          sessions={sessions}
          onKeepOnlyHere={keepOnlyHere}
          onClose={closeSessions}
        />
      )}
    </AuthLayout>
  );
}
