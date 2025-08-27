// pages/signup/password.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Input } from '@/components/design-system/Input';
import { PasswordInput } from '@/components/design-system/PasswordInput';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function SignupWithPassword() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!email || !pw) {
      setErr('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          // After the user clicks the email link, they land on /auth/verify
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/verify`
              : undefined,
        },
      });
      setLoading(false);

      if (error) {
        setErr(error.message);
        return;
      }

      // Redirect to verify page showing "link sent to <email>"
      if (typeof window !== 'undefined') {
        window.location.assign(`/auth/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (e: any) {
      setLoading(false);
      setErr(e?.message || 'Something went wrong. Please try again.');
    }
  }

  // Right side: large logo only (preserves your split-screen design)
  const RightPanel = (
    <div className="hidden md:flex w-1/2 relative items-center justify-center bg-primary/10 dark:bg-dark">
      <Image
        src="/brand/logo.png"
        alt="GramorX Logo"
        width={420}
        height={420}
        className="object-contain"
        priority
      />
    </div>
  );

  return (
    <AuthLayout
      title="Sign up with Email"
      subtitle="Create an account using email & password."
      right={RightPanel}
    >
      {err && (
        <Alert variant="error" title="Error" className="mb-4">
          {err}
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-6 mt-2">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <PasswordInput
          label="Password"
          placeholder="Create a password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          autoComplete="new-password"
          hint="At least 8 characters, including letters and numbers"
        />
        <Button
          type="submit"
          variant="primary"
          className="w-full rounded-ds-xl"
          disabled={loading}
        >
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button asChild variant="secondary" className="rounded-ds-xl w-full">
          <Link href="/signup">Back to Sign-up Options</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-ds-xl w-full">
          <Link href="/login">Already have an account? Log in</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
