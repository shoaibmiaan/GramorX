// pages/api/admin/set-pin.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireRole } from '@/lib/requireRole';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type Resp = { ok: true; status: string } | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    await requireRole(req, ['admin']);
  } catch {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }

  // 2) Input validation
  const { email, newPin } = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {};
  if (!email || !newPin) return res.status(400).json({ ok: false, error: 'Missing email or newPin' });
  if (!/^\d{4,6}$/.test(String(newPin))) return res.status(400).json({ ok: false, error: 'PIN must be 4–6 digits' });

  // 3) Call admin RPC with service_role (server only)
  const svc = createSupabaseServerClient({ serviceRole: true });

  const { data, error } = await svc.rpc('admin_set_premium_pin', { user_email: email, new_pin: String(newPin) });
  if (error) return res.status(500).json({ ok: false, error: error.message });

  if (data === 'SET_OK') return res.status(200).json({ ok: true, status: 'PIN updated' });
  if (data === 'NO_SUCH_USER') return res.status(404).json({ ok: false, error: 'User not found' });
  if (data === 'INVALID_NEW') return res.status(400).json({ ok: false, error: 'Invalid new PIN' });

  return res.status(400).json({ ok: false, error: 'Unexpected result' });
}
