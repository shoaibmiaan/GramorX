// pages/api/referrals/stats.ts
import type { NextApiHandler } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type Stat = Readonly<{
  myCode?: string;
  totalRedemptions: number;
  approvedRedemptions: number;
  pendingRedemptions: number;
  estimatedRewardDays: number; // approved * reward_days
}>;

type ResBody = Readonly<{ ok: true; stats: Stat }> | Readonly<{ ok: false; error: string }>;

const handler: NextApiHandler<ResBody> = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  const supabase = createSupabaseServerClient({ req });
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  // Latest active code
  const { data: myRef } = await supabase
    .from('referrals')
    .select('code')
    .eq('owner_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Redemptions summary
  const { data: redemptions } = await supabase
    .from('referral_redemptions')
    .select('status, reward_days')
    .eq('owner_id', userId);

  const total = redemptions?.length ?? 0;
  let approved = 0;
  let pending = 0;
  let rewardDays = 0;
  (redemptions ?? []).forEach((r) => {
    if (r.status === 'approved') {
      approved += 1;
      rewardDays += Number(r.reward_days ?? 0);
    } else if (r.status === 'pending') {
      pending += 1;
    }
  });

  return res.status(200).json({
    ok: true,
    stats: {
      myCode: myRef?.code,
      totalRedemptions: total,
      approvedRedemptions: approved,
      pendingRedemptions: pending,
      estimatedRewardDays: rewardDays,
    },
  });
};

export default handler;
