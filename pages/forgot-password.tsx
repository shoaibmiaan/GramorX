import React, { useState } from 'react';
import Image from 'next/image';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email) return setErr('Please enter your email.');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/update-password` : undefined,
    });
    setLoading(false);
    if (error) return setErr(error.message);
    setSent(true);
  };

  return (
    <section className="min-h-[100svh] bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="min-h-[100svh] grid place-items-center">
          <Card className="w-full max-w-md p-8 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-4">
              <a href="/login" className="text-small text-primary dark:text-electricBlue">&larr; Back to login</a>
              <Image src="/brand/logo.png" alt="Brand Logo" width={110} height={26} className="h-6 w-auto" />
            </div>

            <h1 className="font-slab text-h1 mb-2 text-primary dark:text-electricBlue">Forgot password</h1>
            <p className="text-grayish dark:text-white/75 mb-6">We’ll email you a reset link.</p>

            {err && <Alert variant="error" title="Couldn’t send" className="mb-4">{err}</Alert>}
            {sent ? (
              <Alert variant="success" title="Email sent" className="mb-4">
                Check your inbox for the reset link.
              </Alert>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <Input label="Email" type="email" placeholder="you@example.com"
                       value={email} onChange={(e)=>setEmail(e.target.value)} required />
                <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </Container>
    </section>
  );
}
