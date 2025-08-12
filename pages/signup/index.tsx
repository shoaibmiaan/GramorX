import React, { useState } from 'react';
import Image from 'next/image';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { supabase } from '@/lib/supabaseClient';

export default function SignupLanding() {
  const [err, setErr] = useState<string|null>(null);
  const [loadingSocial, setLoadingSocial] = useState<'google'|'apple'|'facebook'|null>(null);

  const onSocial = async (provider: 'google'|'apple'|'facebook') => {
    try {
      setErr(null);
      setLoadingSocial(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined },
      });
      if (error) setErr(error.message);
    } catch (e: any) {
      setErr(e?.message || `Could not continue with ${provider}.`);
    } finally {
      setLoadingSocial(null);
    }
  };

  return (
    <section className="min-h-[100svh] bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="min-h-[100svh] grid place-items-center">
          <Card className="w-full max-w-md p-8 rounded-ds-2xl">
            <div className="flex justify-center mb-6">
              <div className="rounded-ds-2xl p-3 bg-purpleVibe/10 dark:bg-electricBlue/10 shadow-sm">
                <Image src="/brand/logo.png" alt="Brand Logo" width={160} height={40} className="h-10 w-auto" priority />
              </div>
            </div>

            <h1 className="font-slab text-display text-center mb-2 text-primary dark:text-electricBlue">
              Start Your IELTS Journey
            </h1>
            <p className="text-center text-grayish dark:text-white/75 mb-6">
              Create your account to begin.
            </p>

            {err && <Alert variant="error" title="Sign‑up issue" className="mb-4">{err}</Alert>}

            <div className="grid gap-2">
              <Button as="a" href="/signup/email" variant="secondary" className="w-full rounded-ds py-2 text-small">
                <i className="far fa-envelope mr-2" aria-hidden /> Sign up with Email
              </Button>
              <Button as="a" href="/signup/phone" variant="secondary" className="w-full rounded-ds py-2 text-small">
                <i className="fas fa-phone mr-2" aria-hidden /> Sign up with Phone
              </Button>
              <Button type="button" variant="secondary" className="w-full rounded-ds py-2 text-small"
                      onClick={() => onSocial('google')} disabled={!!loadingSocial}>
                <i className="fab fa-google mr-2" aria-hidden /> {loadingSocial==='google'?'Continuing…':'Continue with Google'}
              </Button>
              <Button type="button" variant="secondary" className="w-full rounded-ds py-2 text-small"
                      onClick={() => onSocial('apple')} disabled={!!loadingSocial}>
                <i className="fab fa-apple mr-2" aria-hidden /> {loadingSocial==='apple'?'Continuing…':'Continue with Apple'}
              </Button>
              <Button type="button" variant="secondary" className="w-full rounded-ds py-2 text-small"
                      onClick={() => onSocial('facebook')} disabled={!!loadingSocial}>
                <i className="fab fa-facebook-f mr-2" aria-hidden /> {loadingSocial==='facebook'?'Continuing…':'Continue with Facebook'}
              </Button>
            </div>

            <div className="mt-6 text-center text-small text-grayish dark:text-white/60">
              Already have an account?{' '}
              <a href="/login" className="text-primary dark:text-electricBlue font-semibold">Log in</a>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
