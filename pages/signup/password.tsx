// pages/signup/password.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function SignupPassword() {
  const router = useRouter();
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null); // <-- added

  React.useEffect(() => {
    const maybeEmail = (router.query.email as string) || '';
    if (maybeEmail) setEmail(maybeEmail);
  }, [router.query.email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (!email || !password) {
        setErr('Please enter both email and password.');
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErr(error.message || 'Sign up failed.');
        return;
      }
      router.push('/signup/verify?email=' + encodeURIComponent(email));
    } catch (e: any) {
      setErr(e?.message ?? 'Unexpected error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md card-surface p-6 rounded-ds-2xl shadow-glow">
        <h1 className="text-2xl font-semibold mb-2">Create your password</h1>
        <p className="text-mutedText mb-6">Use at least 8 characters.</p>

        {err && (
          <Alert variant="danger" className="mb-4">
            {err}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" disabled={busy} variant="primary" className="w-full">
            {busy ? 'Creating…' : 'Continue'}
          </Button>
        </form>

        <div className="mt-4 text-sm text-mutedText">
          Already have an account?{' '}
          <Link href="/login" className="text-primary underline-offset-2 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
