// lib/payments/easypaisa.ts
import { env } from '@/lib/env';
import type { Cycle, PlanKey } from './index';

export type EasypaisaSession = Readonly<{ url: string; sessionId: string }>;

export function isEasypaisaConfigured(): boolean {
  // Fill in with real keys when wiring live gateway
  return Boolean(env.EASYPASA_MERCHANT_ID && env.EASYPASA_SECRET);
}

export function devEasypaisaSession(origin: string, plan: PlanKey, _cycle: Cycle): EasypaisaSession {
  const sid = `ep_dev_${Date.now()}`;
  return { url: `${origin}/checkout/success?session_id=${sid}&plan=${plan}`, sessionId: sid };
}
