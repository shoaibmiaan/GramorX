import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';

export default function LoginWithEmail() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email) {
      emailRef.current?.focus();
      return setErr('Email and password are required.');
    }
    if (!pw) {
      pwRef.current?.focus();
      return setErr('Email and password are required.');
    }
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) return setErr(error.message);
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      redirectByRole(data.session.user);
    }
  }

  const RightPanel = (
    <div className="h-full flex flex-col justify-between p-8 md:p-12 bg-gradient-to-br from-purpleVibe/10 via-electricBlue/5 to-neonGreen/10 dark:from-dark/50 dark:via-dark/30 dark:to-darker/60">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Image src="/brand/logo.png" alt="GramorX" width={40} height={40} className="rounded-ds object-contain" priority />
          <h2 className="font-slab text-h2 text-gradient-primary">Sign in to GramorX</h2>
        </div>
        <p className="text-body text-grayish dark:text-gray-300 max-w-md">
          Access all IELTS modules with progress tracking & AI feedback.
        </p>
        <ul className="mt-6 space-y-3 text-body text-grayish dark:text-gray-300">
          <li className="flex items-center gap-3"><i className="fas fa-lock" aria-hidden />Secure email & password</li>
          <li className="flex items-center gap-3"><i className="fas fa-bolt" aria-hidden />Fast sign-in experience</li>
        </ul>
      </div>
      <div className="pt-8 text-small text-grayish dark:text-gray-400">
        New here? <Link href="/signup" className="text-primary hover:underline">Create an account</Link>
      </div>
    </div>
  );

  return (
    <AuthLayout title="Sign in with Email" subtitle="Use your email & password." right={RightPanel}>
      {err && <Alert variant="error" title="Error" className="mb-4">{err}</Alert>}
      <form onSubmit={onSubmit} className="space-y-6 mt-2">
        <Input
          ref={emailRef}
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          ref={pwRef}
          label="Password"
          type="password"
          placeholder="Your password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
          {loading ? 'Signing in…' : 'Continue'}
        </Button>
      </form>
      <Button asChild variant="secondary" className="mt-6 rounded-ds-xl w-full">
        <Link href="/login">Back to Login Options</Link>
      </Button>
    </AuthLayout>
  );
}
