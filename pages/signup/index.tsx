'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import {
  AppleIcon,
  GoogleIcon,
  FacebookIcon,
  MailIcon,
  SmsIcon,
} from '@/components/design-system/icons';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-sm uppercase tracking-wide text-mutedText">{children}</div>
  );
}

export default function SignupOptions() {
  const router = useRouter();
  const ref = typeof router.query.ref === 'string' ? router.query.ref : '';

  async function signUpOAuth(provider: 'apple' | 'google' | 'facebook') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== 'undefined' ? `${window.location.origin}/welcome` : undefined,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        router.push(`/login?message=${encodeURIComponent(error.message)}`);
        return;
      }

      if ((data as any)?.linked_email) {
        router.push(`/login?message=${encodeURIComponent('Account exists—use login.')}`);
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      router.push(`/login?message=${encodeURIComponent('Something went wrong. Try again.')}`);
    }
  }

  return (
    <>
      <SectionLabel>Create account</SectionLabel>

      <div className="grid gap-3">
        {/* Email = primary path */}
        <Button
          asChild
          variant="primary"
          className="rounded-ds-xl"
          fullWidth
        >
          <Link href={`/signup/email${ref ? `?ref=${ref}` : ''}`}>
            <span className="inline-flex items-center gap-3">
              <MailIcon className="h-5 w-5" />
              Sign up with Email
            </span>
          </Link>
        </Button>

        {/* Google / Facebook */}
        <Button
          onClick={() => signUpOAuth('google')}
          variant="soft"
          tone="primary"
          className="rounded-ds-xl"
          fullWidth
        >
          <span className="inline-flex items-center gap-3">
            <GoogleIcon className="h-5 w-5" />
            Sign up with Google
          </span>
        </Button>
        <Button
          onClick={() => signUpOAuth('facebook')}
          variant="soft"
          tone="accent"
          className="rounded-ds-xl"
          fullWidth
        >
          <span className="inline-flex items-center gap-3">
            <FacebookIcon className="h-5 w-5" />
            Sign up with Facebook
          </span>
        </Button>

        {/* Apple (disabled until wired) */}
        <Button
          disabled
          variant="soft"
          tone="secondary"
          className="rounded-ds-xl opacity-75"
          fullWidth
        >
          <span className="inline-flex items-center gap-3">
            <AppleIcon className="h-5 w-5" />
            Sign up with Apple (soon)
          </span>
        </Button>

        {/* Phone path */}
        <Button
          asChild
          variant="secondary"
          className="rounded-ds-xl"
          fullWidth
        >
          <Link href={`/signup/phone${ref ? `?ref=${ref}` : ''}`}>
            <span className="inline-flex items-center gap-3">
              <SmsIcon className="h-5 w-5" />
              Sign up with Phone
            </span>
          </Link>
        </Button>
      </div>

      <p className="mt-6 text-sm text-mutedText">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline hover:text-primary/80 transition">
          Log in
        </Link>
      </p>
    </>
  );
}
