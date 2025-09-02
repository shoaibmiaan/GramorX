// components/paywall/UsageCounterBadge.tsx
import * as React from 'react';
import { canUse, type UsageKey } from '@/lib/usage';
import { flags } from '@/lib/flags';

export type UsageCounterBadgeProps = {
  usageKey: UsageKey;
  limit: number;
  className?: string;
  /** Refresh interval in ms; default 45s */
  refreshMs?: number;
  /** Label override (e.g., "AI checks") */
  label?: string;
};

export function UsageCounterBadge({
  usageKey,
  limit,
  className,
  refreshMs = 45_000,
  label,
}: UsageCounterBadgeProps) {
  const [count, setCount] = React.useState<number>(0);
  const [allowed, setAllowed] = React.useState<boolean>(true);

  async function refresh() {
    try {
      const res = await canUse(usageKey, limit);
      setCount(res.count);
      setAllowed(res.allowed);
    } catch {
      // ignore network errors; keep last known
    }
  }

  React.useEffect(() => {
    if (!flags.enabled('paywall')) return; // badge meaningless without paywall
    refresh();
    const id = setInterval(refresh, refreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageKey, limit, refreshMs]);

  if (!flags.enabled('paywall')) return null;

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium',
        allowed ? 'text-foreground' : 'text-error',
        className || '',
      ].join(' ')}
      title={`${count} of ${limit} used today`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: allowed ? 'rgb(var(--color-success))' : 'rgb(var(--color-error))' }} />
      {label ?? 'Today'}: {count}/{limit}
    </span>
  );
}
