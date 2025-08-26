// pages/api/admin/users/set-role.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { requireRole } from '@/lib/requireRole';
import type { Role } from '@/lib/roles';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await requireRole(req, ['admin']);
  } catch {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { userId, role }: { userId: string; role: Role } = req.body;

  // 1) set canonical role in app_metadata (JWT claim)
  const { error: metaErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
    // optionally clear any user_metadata.role drift:
    user_metadata: {} as any,
  });
  if (metaErr) return res.status(400).json({ error: metaErr.message });

  // 2) mirror in profiles
  const { error: profErr } = await supabaseAdmin
    .from('profiles')
    .update({ role, is_admin: role === 'admin', updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (profErr) return res.status(400).json({ error: profErr.message });

  return res.json({ ok: true });
}
