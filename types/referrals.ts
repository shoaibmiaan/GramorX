// types/referrals.ts
export type ReferralCode = string;

export type CreateReferralResponse =
  | Readonly<{ ok: true; code: ReferralCode }>
  | Readonly<{ ok: false; error: string }>;

export type RedeemBody = Readonly<{ code: ReferralCode; context?: 'signup' | 'checkout' }>;
export type RedeemResponse =
  | Readonly<{ ok: true; rewardDays: number }>
  | Readonly<{ ok: false; error: string }>;

export type ReferralStats = Readonly<{
  myCode?: ReferralCode;
  totalRedemptions: number;
  approvedRedemptions: number;
  pendingRedemptions: number;
  estimatedRewardDays: number;
}>;

export type ReferralStatus = 'pending' | 'approved' | 'rejected';
