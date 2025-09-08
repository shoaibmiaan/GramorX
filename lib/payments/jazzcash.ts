import { env } from '@/lib/env';
import type { Cycle, PlanKey } from './index';

export type JazzCashSession = Readonly<{ url: string; sessionId: string }>;

/** Detect if real JazzCash keys are available */
export function isJazzCashConfigured(): boolean {
  return Boolean(env.JAZZCASH_MERCHANT_ID && env.JAZZCASH_INTEGRITY_SALT);
}

/** Dev fallback: returns a mock JazzCash session */
export function devJazzCashSession(origin: string, plan: PlanKey, _cycle: Cycle): JazzCashSession {
  const sid = `jc_dev_${Date.now()}`;
  return { url: `${origin}/checkout/success?session_id=${sid}&plan=${plan}`, sessionId: sid };
}

/** Initiate a JazzCash payment session */
export async function initiateJazzCash(
  origin: string,
  plan: PlanKey,
  cycle: Cycle
): Promise<JazzCashSession> {
  if (!isJazzCashConfigured() || env.NEXT_PUBLIC_DEV_PAYMENTS) {
    return devJazzCashSession(origin, plan, cycle);
  }
  // TODO: Wire to real JazzCash API when keys/SDK are available
  throw new Error('JazzCash live integration not implemented yet.');
}

/** Verify JazzCash payment notification/webhook */
export async function verifyJazzCash(payload: unknown): Promise<boolean> {
  if (!isJazzCashConfigured() || env.NEXT_PUBLIC_DEV_PAYMENTS) {
    return true; // trust all in dev
  }
  // TODO: Implement real signature/hash verification
  throw new Error('JazzCash verification not implemented yet.');
}
