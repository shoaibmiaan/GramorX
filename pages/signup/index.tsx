import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthSidePanel from '@/components/layouts/AuthSidePanel';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

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
    <AuthLayout title="Sign up to GramorX" subtitle="Choose a sign-up method." right={RightPanel}>
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
          <Link href={`/signup/password${ref ? `?ref=${ref}` : ''}`}>
            <span className="inline-flex items-center gap-3"><i className="fas fa-envelope text-xl" aria-hidden /> Sign up with Email</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-ds-xl w-full">
          <Link href={`/signup/phone${ref ? `?ref=${ref}` : ''}`}>
            <span className="inline-flex items-center gap-3"><i className="fas fa-sms text-xl" aria-hidden /> Sign up with Phone</span>
          </Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
