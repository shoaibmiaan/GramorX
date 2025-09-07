// pages/api/institutions/bulk-enroll.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  orgId: z.string().uuid(),
  userIds: z.array(z.string().uuid()).min(1).max(1000),
  role: z.enum(['student','teacher']).default('student'),
});

type BulkEnrollResponse =
  | { ok: true; inserted: number }
  | { ok: false; error: string; code?: 'UNAUTHORIZED'|'FORBIDDEN'|'BAD_REQUEST'|'DB_ERROR' };

export default async function handler(req: NextApiRequest, res: NextApiResponse<BulkEnrollResponse>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  const { orgId, userIds, role } = parsed.data;

  // Admin/manager required
  const { data: me } = await supabase
    .from('institution_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!me || !['owner','admin','manager'].includes((me as any).role)) {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  const rows = userIds.map(uid => ({ org_id: orgId, user_id: uid, role }));
  const { error } = await supabase.from('institution_members').upsert(rows, { onConflict: 'org_id,user_id' });
  if (error) return res.status(500).json({ ok: false, error: error.message, code: 'DB_ERROR' });

  return res.status(200).json({ ok: true, inserted: userIds.length });
}
