import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import AuthLayout from '@/components/layouts/AuthLayout';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function SignupWithPassword() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !pw) return setErr('Please fill in all fields.');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password: pw });
    setLoading(false);
    if (error) return setErr(error.message);
    window.location.assign('/profile-setup');
  };

  return (
    <AuthLayout>
      <h1 className="font-slab text-h2 text-gradient-primary">Sign up with Email</h1>
      <p className="text-grayish mt-1">Create an account using email & password.</p>

      {err && <Alert variant="error" title="Error" className="mt-4">{err}</Alert>}

      <form onSubmit={onSubmit} className="space-y-6 mt-6">
        <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <Input label="Password" type="password" placeholder="Create a password" value={pw} onChange={(e)=>setPw(e.target.value)} required />
        <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>

      <Button asChild variant="secondary" className="mt-6 rounded-ds-xl w-full">
        <Link href="/signup">Back to Sign up</Link>
      </Button>
    </AuthLayout>
  );
}
