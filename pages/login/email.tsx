import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { ThemeToggle } from '@/components/design-system/ThemeToggle';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function LoginWithEmailLink() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email) return setErr('Enter your email.');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
      },
    });
    setLoading(false);
    if (error) return setErr(error.message);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <ThemeToggle className="absolute top-4 right-4" />
      <Container className="max-w-md w-full">
        <h1 className="font-slab text-h2 text-gradient-primary">Email Magic Link</h1>
        <p className="text-grayish mt-1">We’ll send a one-time sign-in link.</p>

        {err && <Alert variant="error" title="Error" className="mt-4">{err}</Alert>}
        {sent ? (
          <Alert variant="success" title="Link sent" className="mt-4">
            Check your inbox. After clicking the link, you’ll be signed in.
          </Alert>
        ) : (
          <form onSubmit={sendLink} className="space-y-6 mt-6">
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
              {loading ? 'Sending…' : 'Send link'}
            </Button>
          </form>
        )}

        <Button as="button" onClick={() => router.push('/login')} variant="secondary" className="mt-6 rounded-ds-xl w-full">
          Back to Login
        </Button>
      </Container>
    </div>
  );
}
