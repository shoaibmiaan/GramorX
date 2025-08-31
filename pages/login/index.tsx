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

export default function LoginIndex() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<'' | 'apple' | 'google' | 'facebook'>('');
  const [selectedRole, setSelectedRole] = useState<Role>('');

  // hydrate role from query
  useEffect(() => {
    const qRole = (router.query.role as Role) ?? '';
    if (qRole && qRole !== selectedRole) setSelectedRole(qRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.role]);

  const roleQuery = useMemo(
    () => (selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : ''),
    [selectedRole]
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
      setErr(e?.message || 'Could not start sign-in. Try again.');
    }
  }

  function onChangeRole(v: string) {
    setSelectedRole(v as Role);
    const { pathname, query, ...rest } = router;
    const nextQuery = { ...query, role: v || undefined };
    router.replace(
      { pathname, query: nextQuery as any },
      undefined,
      { shallow: true }
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue your IELTS journey."
      sidePanel={
        <AuthSidePanel
          title="Focus & momentum"
          items={[
            { icon: ShieldIcon, label: 'Secure login' },
            { icon: ChartIcon, label: 'Track progress' },
          ]}
        />
      }
    >
      <Head>
        <title>Login — GramorX</title>
      </Head>

      {err && <Alert variant="error" className="mb-4">{err}</Alert>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Continue as</label>
          <Select
            value={selectedRole}
            onValueChange={onChangeRole}
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
            aria-label="Sign in with Apple"
          >
            <span className="inline-flex items-center gap-3">
              <AppleIcon className="h-5 w-5" />
              {busy === 'apple' ? 'Opening Apple…' : 'Continue with Apple'}
            </span>
          </Button>

          <Button
            onClick={() => oauth('google')}
            variant="secondary"
            className="rounded-ds-xl"
            fullWidth
            disabled={!!busy}
            aria-label="Sign in with Google"
          >
            <span className="inline-flex items-center gap-3">
              <GoogleIcon className="h-5 w-5" />
              {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
            </span>
          </Button>

          <Button
            onClick={() => oauth('facebook')}
            variant="secondary"
            className="rounded-ds-xl"
            fullWidth
            disabled={!!busy}
            aria-label="Sign in with Facebook"
          >
            <span className="inline-flex items-center gap-3">
              <FacebookIcon className="h-5 w-5" />
              {busy === 'facebook' ? 'Opening Facebook…' : 'Continue with Facebook'}
            </span>
          </Button>

          <Button asChild variant="ghost" className="rounded-ds-xl" fullWidth>
            <Link href={`/login/email${roleQuery}`} aria-label="Sign in with Email and Password">
              <span className="inline-flex items-center gap-3">
                <MailIcon className="h-5 w-5" />
                Email (Password)
              </span>
            </Link>
          </Button>

          <Button asChild variant="ghost" className="rounded-ds-xl" fullWidth>
            <Link href={`/login/phone${roleQuery}`} aria-label="Sign in with Phone OTP">
              <span className="inline-flex items-center gap-3">
                <SmsIcon className="h-5 w-5" />
                Phone (OTP)
              </span>
            </Link>
          </Button>
        </div>

        <div className="mt-4 text-sm">
          <Link
            href={`/signup${roleQuery}`}
            className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline"
          >
            Create an account
          </Link>
        </div>
      </div>

      <div className="mt-8 text-xs text-muted-foreground">
        <Link
          href="/terms"
          className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline"
        >
          Terms
        </Link>
        <span className="px-2">•</span>
        <Link
          href="/privacy"
          className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline"
        >
          Privacy
        </Link>
      </div>
    </AuthLayout>
  );
}
