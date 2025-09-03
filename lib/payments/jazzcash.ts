// lib/payments/jazzcash.ts
import { env } from '@/lib/env';
import type { Cycle, PlanKey } from './index';

export type JazzCashSession = Readonly<{ url: string; sessionId: string }>;

export function isJazzCashConfigured(): boolean {
  // Fill in with real keys when wiring live gateway
  return Boolean(env.JAZZCASH_MERCHANT_ID && env.JAZZCASH_INTEGRITY_SALT);
}

export function devJazzCashSession(origin: string, plan: PlanKey, _cycle: Cycle): JazzCashSession {
  const sid = `jc_dev_${Date.now()}`;
  return { url: `${origin}/checkout/success?session_id=${sid}&plan=${plan}`, sessionId: sid };
}
