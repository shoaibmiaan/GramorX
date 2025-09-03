// pages/api/referrals/redeem.ts
import type { NextApiHandler } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type RedeemBody = Readonly<{ code: string; context?: 'signup' | 'checkout' }>;

type Success = Readonly<{ ok: true; rewardDays: number }>;
type Failure = Readonly<{ ok: false; error: string }>;
type ResBody = Success | Failure;

const handler: NextApiHandler<ResBody> = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  const body: Partial<RedeemBody> = req.body ?? {};
  const code = String(body.code || '').trim().toUpperCase();
  const context = (body.context as 'signup' | 'checkout' | undefined) ?? 'checkout';
  if (!code || code.length < 6) return res.status(400).json({ ok: false, error: 'Invalid code' });

  const supabase = createSupabaseServerClient({ req });
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  // Find the code
  const { data: ref, error: refErr } = await supabase
    .from('referrals')
    .select('code, owner_id, is_active, reward_days, max_uses, uses')
    .eq('code', code)
    .maybeSingle();

  if (refErr || !ref) return res.status(404).json({ ok: false, error: 'Code not found' });
  if (!ref.is_active) return res.status(400).json({ ok: false, error: 'Code is inactive' });
  if (ref.owner_id === userId) return res.status(400).json({ ok: false, error: 'Self-redeem not allowed' });
  if (typeof ref.max_uses === 'number' && typeof ref.uses === 'number' && ref.uses >= ref.max_uses) {
    return res.status(400).json({ ok: false, error: 'Code usage limit reached' });
  }

  // Already redeemed by this user?
  const { data: already } = await supabase
    .from('referral_redemptions')
    .select('id')
    .eq('user_id', userId)
    .eq('code', code)
    .limit(1);

  if (already && already.length > 0) {
    return res.status(400).json({ ok: false, error: 'You have already redeemed this code' });
  }

  // Record redemption (status pending; a job/webhook may grant entitlements)
  const { error: insErr } = await supabase.from('referral_redemptions').insert([
    {
      code,
      owner_id: ref.owner_id,
      user_id: userId,
      status: 'pending',
      context,
      reward_days: ref.reward_days ?? 14,
    },
  ]);
  if (insErr) return res.status(500).json({ ok: false, error: 'Could not record redemption' });

  // Best-effort: increment uses
  await supabase
    .from('referrals')
    .update({ uses: (ref.uses ?? 0) + 1 })
    .eq('code', code);

  return res.status(200).json({ ok: true, rewardDays: ref.reward_days ?? 14 });
};

export default handler;
