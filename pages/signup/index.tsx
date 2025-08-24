import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function SignupOptions() {
  async function signUpOAuth(provider: 'apple' | 'google' | 'facebook') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/profile-setup` : undefined,
      },
    });
  }

  const RightPanel = (
    <div className="h-full flex flex-col justify-between p-8 md:p-12 bg-gradient-to-br from-purpleVibe/10 via-electricBlue/5 to-neonGreen/10 dark:from-dark/50 dark:via-dark/30 dark:to-darker/60">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Image src="/brand/logo.png" alt="GramorX" width={40} height={40} className="rounded-ds object-contain" priority />
          <h2 className="font-slab text-h2 text-gradient-primary">Create your account</h2>
        </div>
        <p className="text-body text-grayish dark:text-gray-300 max-w-md">
          Start your IELTS journey with AI support and personalized plans.
        </p>
        <ul className="mt-6 space-y-3 text-body text-grayish dark:text-gray-300">
          <li className="flex items-center gap-3"><i className="fas fa-user-check" aria-hidden />Apple / Google / Facebook</li>
          <li className="flex items-center gap-3"><i className="fas fa-envelope" aria-hidden />Email & password</li>
          <li className="flex items-center gap-3"><i className="fas fa-mobile-alt" aria-hidden />Phone (OTP)</li>
        </ul>
      </div>
      <div className="pt-8 text-small text-grayish dark:text-gray-400">
        Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
      </div>
    </div>
  );

  return (
    <AuthLayout title="Sign up to GramorX" subtitle="Choose a sign-up method."
      // @ts-expect-error TODO: AuthLayout supports an optional `right` slot
      right={RightPanel}
    >
      <div className="grid gap-3">
        <Button onClick={() => signUpOAuth('apple')} variant="secondary" className="rounded-ds-xl w-full">
          <span className="inline-flex items-center gap-3"><i className="fab fa-apple text-xl" aria-hidden /> Sign up with Apple</span>
        </Button>
        <Button onClick={() => signUpOAuth('google')} variant="secondary" className="rounded-ds-xl w-full">
          <span className="inline-flex items-center gap-3"><i className="fab fa-google text-xl" aria-hidden /> Sign up with Google</span>
        </Button>
        <Button onClick={() => signUpOAuth('facebook')} variant="secondary" className="rounded-ds-xl w-full">
          <span className="inline-flex items-center gap-3"><i className="fab fa-facebook-f text-xl" aria-hidden /> Sign up with Facebook</span>
        </Button>
        <Button asChild variant="secondary" className="rounded-ds-xl w-full">
          <Link href="/signup/password">
            <span className="inline-flex items-center gap-3"><i className="fas fa-envelope text-xl" aria-hidden /> Sign up with Email</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-ds-xl w-full">
          <Link href="/signup/phone">
            <span className="inline-flex items-center gap-3"><i className="fas fa-sms text-xl" aria-hidden /> Sign up with Phone</span>
          </Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
