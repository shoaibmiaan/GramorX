// components/paywall/PaywallGate.tsx
import * as React from 'react';
import { flags } from '@/lib/flags';
import { routes } from '@/lib/routes';
import { canUse, type UsageKey } from '@/lib/usage';
import { getPlan, type PlanId } from '@/types/pricing';

type Feature =
  | 'mock'
  | 'ai.writing'
  | 'ai.speaking'
  | 'ai.explain';

const usageKeyMap: Record<Feature, UsageKey> = {
  mock: 'mock.start',
  'ai.writing': 'ai.writing.grade',
  'ai.speaking': 'ai.speaking.grade',
  'ai.explain': 'ai.explain',
};

function limitFor(feature: Feature, planId: PlanId) {
  const plan = getPlan(planId);
  if (feature === 'mock') return plan.quota.dailyMocks;
  return plan.quota.aiEvaluationsPerDay;
}

export type PaywallGateProps = {
  feature: Feature;
  planId?: PlanId; // default 'free'
  /** If provided, overrides plan-based limit */
  limitOverride?: number;
  children: React.ReactNode;
  /** Custom fallback when blocked */
  fallback?: React.ReactNode;
  /** Called once when blocked is detected */
  onBlocked?: () => void;
  /** Optional className wrapper */
  className?: string;
};

/**
 * Wrap any action area that should be rate-limited on free plans.
 * It checks the current count (step=0) and decides to show children or a paywall prompt.
 */
export function PaywallGate({
  feature,
  planId = 'free',
  limitOverride,
  children,
  fallback,
  onBlocked,
  className,
}: PaywallGateProps) {
  const [allowed, setAllowed] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [count, setCount] = React.useState<number>(0);
  const [limit, setLimit] = React.useState<number>(limitOverride ?? limitFor(feature, planId));

  React.useEffect(() => {
    let mounted = true;

    async function run() {
      // If paywall flag is off -> always allow.
      if (!flags.enabled('paywall')) {
        if (!mounted) return;
        setAllowed(true);
        setLoading(false);
        return;
      }

      const key = usageKeyMap[feature];
      const lim = limitOverride ?? limitFor(feature, planId);

      try {
        const res = await canUse(key, lim);
        if (!mounted) return;
        setCount(res.count);
        setLimit(lim);
        setAllowed(res.allowed);
        setLoading(false);
        if (!res.allowed) onBlocked?.();
      } catch {
        if (!mounted) return;
        // On error, be permissive to avoid false blocks.
        setAllowed(true);
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [feature, planId, limitOverride, onBlocked]);

  if (loading) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-border bg-card text-foreground p-4 animate-pulse-soft">
          <div className="h-4 w-28 bg-foreground/10 rounded mb-2" />
          <div className="h-3 w-40 bg-foreground/10 rounded" />
        </div>
      </div>
    );
  }

  if (allowed) return <>{children}</>;

  if (fallback) return <div className={className}>{fallback}</div>;

  // Default paywall UI
  return (
    <div className={className}>
      <div className="rounded-2xl border border-border bg-card text-foreground p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-warning" />
          <div className="flex-1">
            <h3 className="text-base font-semibold">Limit reached on Free plan</h3>
            <p className="mt-1 text-sm text-foreground/80">
              You used <span className="font-medium">{count}</span> of{' '}
              <span className="font-medium">{limit}</span> free{' '}
              {feature.startsWith('ai') ? 'AI evaluations' : 'mock starts'} today.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={routes.pricing()}
                className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-f
