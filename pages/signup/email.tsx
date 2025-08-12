import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabase } from '@/lib/supabaseClient';

export default function SignupEmail() {
  const router = useRouter();
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false), [err, setErr] = useState<string|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !password) return setErr('Please enter email and password.');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push('/dashboard');
  };

  return (
    <section className="min-h-[100svh] bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="min-h-[100svh] grid place-items-center">
          <Card className="w-full max-w-md p-8 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-4">
              <a href="/signup" className="text-small text-primary dark:text-electricBlue">&larr; Back</a>
              <Image src="/brand/logo.png" alt="Brand Logo" width={110} height={26} className="h-6 w-auto" />
            </div>

            <h1 className="font-slab text-h1 mb-2 text-primary dark:text-electricBlue">Sign up with Email</h1>
            <p className="text-grayish dark:text-white/75 mb-6">Create your account.</p>

            {err && <Alert variant="error" title="Sign‑up failed" className="mb-4">{err}</Alert>}

            <form onSubmit={submit} className="space-y-4">
              <Input label="Email" type="email" placeholder="you@example.com"
                     value={email} onChange={(e)=>setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="••••••••"
                     value={password} onChange={(e)=>setPassword(e.target.value)} required />
              <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
                {loading ? 'Creating…' : 'Create account'}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </section>
  );
}
