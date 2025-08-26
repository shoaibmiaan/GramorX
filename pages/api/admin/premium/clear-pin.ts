// pages/api/admin/premium/clear-pin.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '@/lib/supabaseService';
import { requireRole } from '@/lib/requireRole';

type Resp =
  | { ok: true; userId: string }
  | { ok: false; reason: 'NOT_ADMIN' | 'BAD_INPUT' | 'USER_NOT_FOUND' }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await requireRole(req, ['admin']);
  } catch {
    return res.status(403).json({ ok: false, reason: 'NOT_ADMIN' });
  }

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
