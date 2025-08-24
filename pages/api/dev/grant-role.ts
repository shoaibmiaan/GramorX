// pages/api/dev/grant-role.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Disabled in production' });
  }
  if (req.method !== 'POST') return res.status(405).end();

  const authz = req.headers.authorization?.replace('Bearer ', '');
  if (!authz || authz !== process.env.LOCAL_ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, role = 'admin' } = req.body as { email: string; role?: 'admin' | 'teacher' | 'student' };
  if (!email) return res.status(400).json({ error: 'email required' });
  if (!['admin','teacher','student'].includes(role)) return res.status(400).json({ error: 'invalid role' });

  // naive scan (fine for dev)
  let targetUserId: string | null = null;
  let page = 1;
  while (!targetUserId) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return res.status(500).json({ error: error.message });
    if (!data?.users?.length) break;
    const found = data.users.find(u => (u.email ?? '').toLowerCase() === email.toLowerCase());
    if (found) targetUserId = found.id;
    else page++;
  }
  if (!targetUserId) return res.status(404).json({ error: 'User not found' });

  const { data: updated, error: upErr } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
    app_metadata: { role },
  });
  if (upErr) return res.status(500).json({ error: upErr.message });

  return res.json({ ok: true, userId: updated.user?.id, role });
}
