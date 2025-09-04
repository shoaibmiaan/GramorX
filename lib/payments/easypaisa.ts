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

// Placeholder implementations for API handlers
export async function initiateEasypaisa(_orderId: string, _amount: number): Promise<string> {
  // TODO: integrate with Easypaisa gateway
  return '#';
}

export function verifyEasypaisa(_payload: any): boolean {
  // TODO: verify Easypaisa webhook payload
  return true;
}
