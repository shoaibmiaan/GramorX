// lib/referrals.ts
export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isLikelyValidCode(code: string): boolean {
  const s = normalizeCode(code);
  return s.length >= 6 && s.length <= 64 && /^[A-Z0-9]+$/.test(s);
}

export function generateCode(len = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/** Simple utility to estimate reward days given status. */
export function estimatedRewardDays(approvedCount: number, rewardPerRedeem = 14): number {
  return Math.max(0, Math.floor(approvedCount)) * Math.max(0, Math.floor(rewardPerRedeem));
}
