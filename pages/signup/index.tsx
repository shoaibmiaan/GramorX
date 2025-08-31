import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthSidePanel from '@/components/layouts/AuthSidePanel';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { Select } from '@/components/design-system/Select';
import {
  AppleIcon,
  GoogleIcon,
  FacebookIcon,
  MailIcon,
  SmsIcon,
  ShieldIcon,
  ChartIcon,
} from '@/components/design-system/icons';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

type Role = 'student' | 'teacher' | 'admin' | '';

export default function SignupIndex() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<'' | 'apple' | 'google' | 'facebook'>('');
  const [role, setRole] = useState<Role>('');

  useEffect(() => {
    const qRole = (router.query.role as Role) ?? '';
    if (qRole && qRole !== role) setRole(qRole);
  }, [router.query.role, role]);

  const roleQuery = useMemo(
    () => (role ? `?role=${encodeURIComponent(role)}` : ''),
    [role]
  );

  async function oauth(provider: 'apple' | 'google' | 'facebook') {
    try {
      setErr(null);
      setBusy(provider);

      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const next = `/dashboard${roleQuery}`;
      const redirectTo = origin
        ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
        : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (e: any) {
      setBusy('');
      setErr(e?.message || 'Could not start sign-up. Try again.');
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Set up your role and start learning."
      sidePanel={
        <AuthSidePanel
          title="Account benefits"
          items={[
            { icon: ChartIcon, label: 'Personalized path' },
            { icon: ShieldIcon, label: 'Protected data' },
          ]}
        />
      }
    >
      <Head>
        <title>Sign up — GramorX</title>
      </Head>

      {err && <Alert variant="error" className="mb-4">{err}</Alert>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Join as</label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as Role)}
            placeholder="Select your role"
            options={[
              { label: 'Student', value: 'student' },
              { label: 'Teacher', value: 'teacher' },
              { label: 'Admin', value: 'admin' },
            ]}
          />
        </div>

        <div className="grid gap-3">
          <Button
            onClick={() => oauth('apple')}
            variant="primary"
            className="rounded-ds-xl"
            fullWidth
            disabled={!!busy}
            aria-label="Sign up with Apple"
          >
            <span className="inline-flex items-center gap-3">
              <AppleIcon className="h-5 w-5" />
              {busy === 'apple' ? 'Opening Apple…' : 'Sign up with Apple'}
            </span>
          </Button>

          <Button
            onClick={() => oauth('google')}
            variant="secondary"
            className="rounded-ds-xl"
            fullWidth
            disabled={!!busy}
            aria-label="Sign up with Google"
          >
            <span className="inline-flex items-center gap-3">
              <GoogleIcon className="h-5 w-5" />
              {busy === 'google' ? 'Opening Google…' : 'Sign up with Google'}
            </span>
          </Button>

          <Button
            onClick={() => oauth('facebook')}
            variant="secondary"
            className="rounded-ds-xl"
            fullWidth
            disabled={!!busy}
            aria-label="Sign up with Facebook"
          >
            <span className="inline-flex items-center gap-3">
              <FacebookIcon className="h-5 w-5" />
              {busy === 'facebook' ? 'Opening Facebook…' : 'Sign up with Facebook'}
            </span>
          </Button>

          <Button asChild variant="ghost" className="rounded-ds-xl" fullWidth>
            <Link href={`/signup/email${roleQuery}`} aria-label="Sign up with Email and Password">
              <span className="inline-flex items-center gap-3">
                <MailIcon className="h-5 w-5" />
                Email (Password)
              </span>
            </Link>
          </Button>

          <Button asChild variant="ghost" className="rounded-ds-xl" fullWidth>
            <Link href={`/signup/phone${roleQuery}`} aria-label="Sign up with Phone OTP">
              <span className="inline-flex items-center gap-3">
                <SmsIcon className="h-5 w-5" />
                Phone (OTP)
              </span>
            </Link>
          </Button>
        </div>

        <div className="mt-4 text-sm">
          <Link
            href={`/login${roleQuery}`}
            className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      <div className="mt-8 text-xs text-muted-foreground">
        <Link href="/terms" className="underline underline-offset-4 hover:no-underline">
          Terms
        </Link>
        <span className="px-2">•</span>
        <Link href="/privacy" className="underline underline-offset-4 hover:no-underline">
          Privacy
        </Link>
      </div>
    </AuthLayout>
  );
}
