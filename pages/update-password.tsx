import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabase } from '@/lib/supabaseClient';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false), [err, setErr] = useState<string|null>(null);
  const [ok, setOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!password) return setErr('Please enter a new password.');
    setLoading(true);
    const { data: reused, error: rpcError } = await supabase.rpc('password_is_reused', { new_password: password });
    if (rpcError) {
      setLoading(false);
      return setErr(rpcError.message);
    }
    if (reused) {
      setLoading(false);
      return setErr('Cannot reuse old password.');
    }
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setErr(error.message);
    setOk(true);
    setTimeout(() => router.push('/login'), 800);
  };

  return (
    <section className="min-h-[100svh] bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="min-h-[100svh] grid place-items-center">
          <Card className="w-full max-w-md p-8 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-small text-grayish dark:text-white/60">&nbsp;</span>
              <Image src="/brand/logo.png" alt="Brand Logo" width={110} height={26} className="h-6 w-auto" />
            </div>

            <h1 className="font-slab text-h1 mb-2 text-primary dark:text-electricBlue">Set a new password</h1>
            <p className="text-grayish dark:text-white/75 mb-6">Enter your new password to continue.</p>

            {err && <Alert variant="error" title="Couldn’t update" className="mb-4">{err}</Alert>}
            {ok && <Alert variant="success" title="Updated" className="mb-4">Redirecting to login…</Alert>}

            <form onSubmit={submit} className="space-y-4">
              <Input label="New password" type="password" placeholder="••••••••"
                     value={password} onChange={(e)=>setPassword(e.target.value)} required />
              <Button type="submit" variant="primary" className="w-full rounded-ds-xl" disabled={loading}>
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </section>
  );
}
