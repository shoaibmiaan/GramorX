import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthSidePanel from '@/components/layouts/AuthSidePanel';
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
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/welcome` : undefined,
        skipBrowserRedirect: true,
      },
    });

    if (data?.linked_email) {
      router.push(`/login?message=${encodeURIComponent('Account exists—use login.')}`);
    } else if (data?.url) {
      window.location.href = data.url;
    }
  }

  const features = [
    (
      <>
        <i className="fas fa-user-check" aria-hidden />
        Apple / Google / Facebook
      </>
    ),
    (
      <>
        <i className="fas fa-envelope" aria-hidden />
        Email &amp; password
      </>
    ),
    (
      <>
        <i className="fas fa-mobile-alt" aria-hidden />
        Phone (OTP)
      </>
    ),
  ];

  const RightPanel = (
    <AuthSidePanel
      title="Create your account"
      description="Start your IELTS journey with AI support and personalized plans."
      features={features}
      footerLink={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primaryDark hover:underline">
            Log in
          </Link>
        </>
      }
    />
  );

  return (
    <AuthLayout title="Sign up to GramorX" subtitle="Choose a sign-up method." right={RightPanel} showRightOnMobile>
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
        <Button asChild variant="secondary" className="rounded-ds-xl" fullWidth>
          <Link href={`/signup/password${ref ? `?ref=${ref}` : ''}`}>
            <span className="inline-flex items-center gap-3"><MailIcon className="h-5 w-5" /> Sign up with Email</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-ds-xl" fullWidth>
          <Link href={`/signup/phone${ref ? `?ref=${ref}` : ''}`}>
            <span className="inline-flex items-center gap-3"><SmsIcon className="h-5 w-5" /> Sign up with Phone</span>
          </Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
