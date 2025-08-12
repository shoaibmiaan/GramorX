import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Container } from '@/components/design-system/Container';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { ThemeToggle } from '@/components/design-system/ThemeToggle';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !pw) return setErr('Please fill in all fields.');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      {/* Left: form */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => router.push('/')} className="font-slab text-h2 md:text-display text-gradient-primary">
            GramorX
          </button>
          <span className="text-small text-grayish dark:text-gray-400">You are signing into GramorX</span>
        </div>

        <Container className="max-w-md w-full">
          {err && <Alert variant="error" title="Error" className="mb-4">{err}</Alert>}

          <form onSubmit={onSubmit} className="space-y-6 mt-6">
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="Enter your password" value={pw} onChange={(e)=>setPw(e.target.value)} required />
            <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
              {loading ? 'Signing in…' : 'Continue'}
            </Button>
          </form>

          <div className="mt-6 grid gap-3">
            <Button as="a" href="/login/email" variant="secondary" className="rounded-ds-xl w-full">Use Magic Link</Button>
            <Button as="a" href="/login/phone" variant="secondary" className="rounded-ds-xl w-full">Use Phone (OTP)</Button>
          </div>

          <div className="mt-6 text-center text-small text-grayish dark:text-gray-400">
            Don’t have an account?{' '}
            <button type="button" onClick={() => router.push('/signup')} className="text-primary hover:underline">
              Sign up
            </button>
          </div>
        </Container>
      </div>

      {/* Right: brand */}
      <div className="hidden md:flex w-1/2 relative bg-primary/10 dark:bg-dark items-center justify-center">
        <Image src="/brand/logo.png" alt="GramorX Logo" width={420} height={420} className="object-contain" />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
