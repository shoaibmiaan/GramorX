import { env } from "@/lib/env";
// pages/api/admin/premium/clear-pin.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabaseService, isAdminEmail } from '@/lib/supabaseService';

type Resp =
  | { ok: true; userId: string }
  | { ok: false; reason: 'NOT_ADMIN' | 'BAD_INPUT' | 'USER_NOT_FOUND' }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHdr = req.headers.authorization || '';
  const token = authHdr.startsWith('Bearer ') ? authHdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseCaller = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const { data: userData } = await supabaseCaller.auth.getUser();
  if (!isAdminEmail(userData?.user?.email)) return res.status(403).json({ ok: false, reason: 'NOT_ADMIN' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const targetEmail: string | undefined = body?.email;
  if (!targetEmail) return res.status(400).json({ ok: false, reason: 'BAD_INPUT' });

  const { data: found, error: findErr } = await supabaseService.auth.admin.listUsers({ page: 1, perPage: 1, email: targetEmail });
  if (findErr) return res.status(500).json({ error: findErr.message });

  const target = found?.users?.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
  if (!target) return res.status(404).json({ ok: false, reason: 'USER_NOT_FOUND' });

  const { error: delErr } = await supabaseService.from('premium_pins').delete().eq('user_id', target.id);
  if (delErr) return res.status(500).json({ error: delErr.message });

  return res.status(200).json({ ok: true, userId: target.id });
}
