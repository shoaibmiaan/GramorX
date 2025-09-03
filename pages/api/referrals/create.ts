// pages/api/referrals/create.ts
import type { NextApiHandler } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type Success = Readonly<{ ok: true; code: string }>;
type Failure = Readonly<{ ok: false; error: string }>;
type ResBody = Success | Failure;

function genCode(len = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

const handler: NextApiHandler<ResBody> = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  const supabase = createSupabaseServerClient({ req });
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  // Return existing active code if present
  const { data: existing, error: selErr } = await supabase
    .from('referrals')
    .select('code, is_active')
    .eq('owner_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selErr) {
    // Not fatal — continue to attempt create
  } else if (existing?.code) {
    return res.status(200).json({ ok: true, code: existing.code });
  }

  // Create a fresh code
  let attempts = 0;
  while (attempts < 5) {
    attempts++;
    const code = genCode(8);

    const { error: insErr } = await supabase.from('referrals').insert([
      {
        code,
        owner_id: userId,
        is_active: true,
        uses: 0,
        max_uses: 100,
        reward_days: 14,
      },
    ]);

    if (!insErr) return res.status(200).json({ ok: true, code });
    // On unique violation, retry with new code
  }

  return res.status(500).json({ ok: false, error: 'Could not create referral code' });
};

export default handler;
