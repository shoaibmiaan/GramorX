// pages/api/partners/summary.ts
import type { NextApiHandler } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type Summary = Readonly<{
  totalClicks: number;          // placeholder until click tracking added
  totalSignups: number;         // distinct users who redeemed any of your codes
  totalApproved: number;        // approved redemptions
  topCodes: Array<{ code: string; approved: number; pending: number }>;
}>;

type ResBody = Readonly<{ ok: true; summary: Summary }> | Readonly<{ ok: false; error: string }>;

const handler: NextApiHandler<ResBody> = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  const supabase = createSupabaseServerClient({ req });
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  // Fetch all your codes
  const { data: codes } = await supabase
    .from('referrals')
    .select('code')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  const codeList = (codes ?? []).map((c) => c.code);
  if (codeList.length === 0) {
    return res.status(200).json({
      ok: true,
      summary: { totalClicks: 0, totalSignups: 0, totalApproved: 0, topCodes: [] },
    });
  }

  // Aggregate redemptions for your codes
  const { data: reds } = await supabase
    .from('referral_redemptions')
    .select('code, user_id, status')
    .in('code', codeList);

  const map = new Map<string, { approved: number; pending: number; users: Set<string> }>();
  (reds ?? []).forEach((r) => {
    const m = map.get(r.code) ?? { approved: 0, pending: 0, users: new Set<string>() };
    if (r.status === 'approved') m.approved += 1;
    if (r.status === 'pending') m.pending += 1;
    if (r.user_id) m.users.add(r.user_id);
    map.set(r.code, m);
  });

  let totalApproved = 0;
  const topCodes = Array.from(map.entries()).map(([code, m]) => {
    totalApproved += m.approved;
    return { code, approved: m.approved, pending: m.pending };
  });

  const totalSignups = Array.from(map.values()).reduce((acc, m) => acc + m.users.size, 0);

  return res.status(200).json({
    ok: true,
    summary: {
      totalClicks: 0, // add tracking later (utm/ref click logs)
      totalSignups,
      totalApproved,
      topCodes: topCodes.sort((a, b) => b.approved - a.approved).slice(0, 10),
    },
  });
};

export default handler;
