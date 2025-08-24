import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Input } from '@/components/design-system/Input';
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
    if (!email || !pw) return setErr('Please fill in all fields.');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password: pw });
    setLoading(false);
    if (error) return setErr(error.message);
    window.location.assign('/profile-setup');
  }

  const RightPanel = (
    <div className="h-full flex flex-col justify-between p-8 md:p-12 bg-gradient-to-br from-purpleVibe/10 via-electricBlue/5 to-neonGreen/10 dark:from-dark/50 dark:via-dark/30 dark:to-darker/60">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Image src="/brand/logo.png" alt="GramorX" width={40} height={40} className="rounded-ds object-contain" priority />
          <h2 className="font-slab text-h2 text-gradient-primary">Create with Email</h2>
        </div>
        <p className="text-body text-grayish dark:text-gray-300 max-w-md">Set your email and password to get started.</p>
      </div>
      <div className="pt-8 text-small text-grayish dark:text-gray-400">
        Prefer phone? <Link href="/signup/phone" className="text-primary hover:underline">Use Phone (OTP)</Link>
      </div>
    </div>
  );

  return (
    <AuthLayout title="Sign up with Email" subtitle="Create an account using email & password."
      // @ts-expect-error TODO: AuthLayout supports an optional `right` slot
      right={RightPanel}
    >
      {err && <Alert variant="error" title="Error" className="mb-4">{err}</Alert>}
      <form onSubmit={onSubmit} className="space-y-6 mt-2">
        <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <Input label="Password" type="password" placeholder="Create a password" value={pw} onChange={(e)=>setPw(e.target.value)} required />
        <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>
      <Button asChild variant="secondary" className="mt-6 rounded-ds-xl w-full">
        <Link href="/signup">Back to Sign-up Options</Link>
      </Button>
    </AuthLayout>
  );
}
