import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const BodySchema = z.object({
  counter: z.enum([
    'listening_attempts',
    'reading_attempts',
    'writing_ai_checks',
    'speaking_minutes',
  ]),
  delta: z.number().int().min(1).max(120),
});

type Resp = {
  ok: true;
  counter: string;
  current: number;
  limit: number;
  blocked: boolean;
} | { ok: false; error: string };

// Default free limits (per day). You can override via env vars later.
const FREE_LIMITS = {
  listening_attempts: Number(process.env.LIMIT_FREE_LISTENING ?? 1),
  reading_attempts: Number(process.env.LIMIT_FREE_READING ?? 1),
  writing_ai_checks: Number(process.env.LIMIT_FREE_WRITING_AI ?? 2),
  speaking_minutes: Number(process.env.LIMIT_FREE_SPEAKING_MIN ?? 10),
};
// Booster/Master limits (examples)
const BOOSTER_LIMITS = {
  listening_attempts: 999,
  reading_attempts: 999,
  writing_ai_checks: 50,
  speaking_minutes: 120,
};
const MASTER_LIMITS = {
  listening_attempts: 999,
  reading_attempts: 999,
  writing_ai_checks: 200,
  speaking_minutes: 240,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ ok: false, error: parse.error.issues.map(i => i.message).join(', ') });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(503).json({ ok: false, error: 'Supabase env missing' });

  // Auth: require Bearer token so we know the user
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ ok: false, error: 'Missing Authorization bearer token' });

  const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user?.id) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const userId = userRes.user.id;

  const { counter, delta } = parse.data;

  // Determine plan & limits
  let plan: 'free'|'starter'|'booster'|'master' = 'free';
  try {
    const { data: profile } = await supabase.from('profiles').select('membership_plan').eq('id', userId).single();
    if (profile?.membership_plan) plan = profile.membership_plan as typeof plan;
  } catch { /* ignore */ }

  const limit = plan === 'master' ? MASTER_LIMITS[counter]
    : plan === 'booster' || plan === 'starter' ? BOOSTER_LIMITS[counter]
    : FREE_LIMITS[counter];

  // Read today's current
  const today = new Date().toISOString().slice(0, 10);
  const { data: row } = await supabase
    .from('usage_counters')
    .select('id,current')
    .eq('user_id', userId)
    .eq('counter', counter)
    .eq('date', today)
    .single();

  const current = row?.current ?? 0;
  const proposed = current + delta;
  const blocked = proposed > limit;

  if (!blocked) {
    if (row?.id) {
      await supabase.from('usage_counters').update({ current: proposed }).eq('id', row.id);
    } else {
      await supabase.from('usage_counters').insert({ user_id: userId, counter, date: today, current: proposed });
    }
  }

  return res.status(200).json({ ok: true, counter, current: blocked ? current : proposed, limit, blocked });
}
