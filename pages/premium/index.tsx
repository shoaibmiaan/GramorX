// pages/premium/index.tsx
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { ThemeSwitcherPremium } from '@/premium-ui/theme/ThemeSwitcher';
import { PrCard } from '@/premium-ui/components/PrCard';
import { PrButton } from '@/premium-ui/components/PrButton';

type Props = {
  userId: string;
  plan: string | null; // e.g. 'free' | 'starter' | 'booster' | 'premium' | 'master' | null
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  // ✅ Pass ONLY req into your helper (matches its Options type)
  const supabase = createSupabaseServerClient({ req: ctx.req });

  // Check current user from the Bearer token (Authorization set by helper)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: `/login?next=${encodeURIComponent(ctx.resolvedUrl || '/premium')}`,
        permanent: false,
      },
    };
  }

  // 🔐 MFA gate → redirect to your PIN/MFA page if enabled but not verified
  const m = (user.user_metadata ?? {}) as Record<string, any>;
  const mfaEnabled = !!m.mfa_enabled;
  const mfaVerified = !!m.mfa_verified;
  if (mfaEnabled && !mfaVerified) {
    return {
      redirect: {
        destination: `/auth/mfa?next=${encodeURIComponent(ctx.resolvedUrl || '/premium')}`,
        permanent: false,
      },
    };
  }

  // 💳 Plan/membership gate (adjust table/column if different)
  const { data: prof } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = (prof?.plan ?? null) as string | null;
  const hasPremium = plan === 'premium' || plan === 'master';
  if (!hasPremium) {
    return {
      redirect: {
        destination: `/pricing?reason=premium_required&next=${encodeURIComponent(ctx.resolvedUrl || '/premium')}`,
        permanent: false,
      },
    };
  }

  return { props: { userId: user.id, plan } };
};

export default function PremiumHome({ plan }: Props) {
  const router = useRouter();

  return (
    <main className="pr-p-6 pr-space-y-6">
      <div className="pr-flex pr-items-center pr-justify-between">
        <h1 className="pr-text-2xl pr-font-semibold">Premium Exam Room</h1>
        <ThemeSwitcherPremium />
      </div>

      <div className="pr-grid md:pr-grid-cols-2 pr-gap-6">
        <PrCard className="pr-p-6">
          <h2 className="pr-text-lg pr-font-semibold">IELTS Listening</h2>
          <p className="pr-muted pr-mt-2">Strict playback, timers, and section navigation.</p>
          <div className="pr-mt-4 pr-flex pr-gap-3">
            <PrButton onClick={() => router.push('/premium/listening/sample-test')}>
              Start Sample Test
            </PrButton>
            <Link href="/listening" className="pr-text-sm pr-underline pr-underline-offset-2">
              Practice mode
            </Link>
          </div>
        </PrCard>

        <PrCard className="pr-p-6">
          <h2 className="pr-text-lg pr-font-semibold">IELTS Reading</h2>
          <p className="pr-muted pr-mt-2">Passage panes, answers grid, and review flags.</p>
          <div className="pr-mt-4 pr-flex pr-gap-3">
            <PrButton onClick={() => router.push('/premium/reading/sample-test')}>
              Start Sample Test
            </PrButton>
            <Link href="/reading" className="pr-text-sm pr-underline pr-underline-offset-2">
              Practice mode
            </Link>
          </div>
        </PrCard>
      </div>
    </main>
  );
}
