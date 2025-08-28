// pages/signup/password.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Input } from '@/components/design-system/Input';
import { PasswordInput } from '@/components/design-system/PasswordInput';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { isValidEmail } from '@/utils/validation';

export default function SignupWithPassword() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [referral, setReferral] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof router.query.ref === 'string') {
      setReferral(router.query.ref);
    }
  }, [router.query.ref]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!email || !pw) {
      setErr('Please fill in all fields.');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailErr('Enter a valid email address.');
      return;
    }

    setEmailErr(null);

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/verify`
              : undefined,
          data: referral ? { referral_code: referral.trim() } : undefined,
        },
      });
      setLoading(false);

      if (error) {
        setErr(error.message);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (referral && session) {
        try {
          await fetch('/api/referrals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ code: referral.trim() }),
          });
        } catch (err) {
          // ignore
        }
      }

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
          onChange={(e) => {
            const v = e.target.value;
            setEmail(v);
            setEmailErr(!v || isValidEmail(v) ? null : 'Enter a valid email address.');
          }}
          autoComplete="email"
          required
          error={emailErr ?? undefined}
        />
        <PasswordInput
          label="Password"
          placeholder="Create a password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="new-password"
          required
          hint="At least 8 characters, including letters and numbers"
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
