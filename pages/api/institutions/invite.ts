// pages/api/institutions/invite.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  orgId: z.string().uuid(),
  emails: z.array(z.string().email()).min(1).max(200),
  role: z.enum(['student', 'teacher', 'manager', 'admin']).default('student'),
  message: z.string().max(500).optional(),
});

type InviteResponse =
  | { ok: true; invited: number }
  | { ok: false; error: string; code?: 'UNAUTHORIZED'|'FORBIDDEN'|'BAD_REQUEST'|'DB_ERROR'|'NOT_FOUND' };

export default async function handler(req: NextApiRequest, res: NextApiResponse<InviteResponse>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  const { orgId, emails, role, message } = parsed.data;

  // Must be admin/manager/owner in org
  const { data: me } = await supabase
    .from('institution_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!me || !['owner','admin','manager'].includes((me as any).role)) {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  // Insert invitations (UPSERT on unique (org_id, email))
  const rows = emails.map(e => ({ org_id: orgId, email: e.toLowerCase(), invited_by: user.id, role, message: message ?? null, status: 'pending' }));
  const { error } = await supabase.from('institution_invites').upsert(rows, { onConflict: 'org_id,email' });

  if (error) return res.status(500).json({ ok: false, error: error.message, code: 'DB_ERROR' });

  // Optional: enqueue email notifications via a table/cron
  await supabase.from('outbox_emails').insert(
    emails.map(e => ({ to_email: e, template: 'institution_invite', data_json: { orgId, role, message } }))
  ).catch(() => { /* best-effort */ });

  return res.status(200).json({ ok: true, invited: emails.length });
}
