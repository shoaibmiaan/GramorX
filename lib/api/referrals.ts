// lib/api/referrals.ts
export type CreateReferralResponse =
  | Readonly<{ ok: true; code: string }>
  | Readonly<{ ok: false; error: string }>;

export type RedeemBody = Readonly<{ code: string; context?: 'signup' | 'checkout' }>;
export type RedeemResponse =
  | Readonly<{ ok: true; rewardDays: number }>
  | Readonly<{ ok: false; error: string }>;

export type ReferralStats = Readonly<{
  myCode?: string;
  totalRedemptions: number;
  approvedRedemptions: number;
  pendingRedemptions: number;
  estimatedRewardDays: number;
}>;

export type StatsResponse =
  | Readonly<{ ok: true; stats: ReferralStats }>
  | Readonly<{ ok: false; error: string }>;

export async function createReferralCode(): Promise<CreateReferralResponse> {
  const res = await fetch('/api/referrals/create', { method: 'POST' });
  return (await res.json()) as CreateReferralResponse;
}

export async function redeemReferral(body: RedeemBody): Promise<RedeemResponse> {
  const res = await fetch('/api/referrals/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await res.json()) as RedeemResponse;
}

export async function getReferralStats(): Promise<StatsResponse> {
  const res = await fetch('/api/referrals/stats');
  return (await res.json()) as StatsResponse;
}
