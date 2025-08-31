import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import {
  AppleIcon,
  GoogleIcon,
  FacebookIcon,
  MailIcon,
  SmsIcon,
  PhoneIcon,
  UserCheckIcon,
} from '@/components/design-system/icons';

export default function SignupOptions() {
  const router = useRouter();
  const ref = typeof router.query.ref === 'string' ? router.query.ref : '';

  async function signUpOAuth(provider: 'apple' | 'google' | 'facebook') {
    const { data } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/profile/setup` : undefined,
        skipBrowserRedirect: true,
      },
    });

    if (data?.linked_email) {
      router.push(`/login?message=${encodeURIComponent('Account exists—use login.')}`);
    } else if (data?.url) {
      window.location.href = data.url;
    }
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
          <li className="flex items-center gap-3"><UserCheckIcon className="h-5 w-5" />Apple / Google / Facebook</li>
          <li className="flex items-center gap-3"><MailIcon className="h-5 w-5" />Email & password</li>
          <li className="flex items-center gap-3"><PhoneIcon className="h-5 w-5" />Phone (OTP)</li>
        </ul>
      </div>
      <div className="pt-8 text-small text-grayish dark:text-gray-400">
        Already have an account? <Link href="/login" className="text-primaryDark hover:underline">Log in</Link>
      </div>
    </div>
  );

  return (
    <AuthLayout title="Sign up to GramorX" subtitle="Choose a sign-up method." right={RightPanel}>
      <div className="grid gap-3">
        <Button onClick={() => signUpOAuth('apple')} variant="secondary" className="rounded-ds-xl w-full">
          <span className="inline-flex items-center gap-3"><AppleIcon className="h-5 w-5" /> Sign up with Apple</span>
        </Button>
        <Button onClick={() => signUpOAuth('google')} variant="secondary" className="rounded-ds-xl w-full">
          <span className="inline-flex items-center gap-3"><GoogleIcon className="h-5 w-5" /> Sign up with Google</span>
        </Button>
        <Button onClick={() => signUpOAuth('facebook')} variant="secondary" className="rounded-ds-xl w-full">
          <span className="inline-flex items-center gap-3"><FacebookIcon className="h-5 w-5" /> Sign up with Facebook</span>
        </Button>
        <Button asChild variant="secondary" className="rounded-ds-xl w-full">
          <Link href={`/signup/password${ref ? `?ref=${ref}` : ''}`}>
            <span className="inline-flex items-center gap-3"><MailIcon className="h-5 w-5" /> Sign up with Email</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-ds-xl w-full">
          <Link href={`/signup/phone${ref ? `?ref=${ref}` : ''}`}>
            <span className="inline-flex items-center gap-3"><SmsIcon className="h-5 w-5" /> Sign up with Phone</span>
          </Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
