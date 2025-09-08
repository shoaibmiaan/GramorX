import { env } from '@/lib/env';
import type { Cycle, PlanKey } from './index';

export type EasypaisaSession = Readonly<{ url: string; sessionId: string }>;

/** Detect if real Easypaisa keys are available */
export function isEasypaisaConfigured(): boolean {
  return Boolean(env.EASYPASA_MERCHANT_ID && env.EASYPASA_SECRET);
}

/** Dev fallback: returns a mock Easypaisa session */
export function devEasypaisaSession(origin: string, plan: PlanKey, _cycle: Cycle): EasypaisaSession {
  const sid = `ep_dev_${Date.now()}`;
  return { url: `${origin}/checkout/success?session_id=${sid}&plan=${plan}`, sessionId: sid };
}

/** Initiate an Easypaisa payment session */
export async function initiateEasypaisa(
  origin: string,
  plan: PlanKey,
  cycle: Cycle
): Promise<EasypaisaSession> {
  if (!isEasypaisaConfigured() || env.NEXT_PUBLIC_DEV_PAYMENTS) {
    return devEasypaisaSession(origin, plan, cycle);
  }
  // TODO: Wire to real Easypaisa API when keys/SDK are available
  throw new Error('Easypaisa live integration not implemented yet.');
}

/** Verify Easypaisa payment notification/webhook */
export async function verifyEasypaisa(payload: unknown): Promise<boolean> {
  if (!isEasypaisaConfigured() || env.NEXT_PUBLIC_DEV_PAYMENTS) {
    return true; // trust all in dev
  }
  // TODO: Implement real signature/hash verification
  throw new Error('Easypaisa verification not implemented yet.');
}
