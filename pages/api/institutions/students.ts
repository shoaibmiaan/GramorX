// pages/api/institutions/students.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const QuerySchema = z.object({
  orgId: z.string().uuid(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  q: z.string().trim().max(80).optional(), // name/email search
  sort: z.enum(['new', 'name']).default('new'),
});

type StudentRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  joined_at: string | null;
  latest_band: number | null;
  attempts_count: number | null;
};

type StudentCard = {
  userId: string;
  name: string;
  email: string | null;
  joinedAt?: string | null;
  latestBand?: number | null;
  attempts?: number | null;
};

type StudentsResponse =
  | { ok: true; items: StudentCard[]; page: number; pageSize: number; total: number }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'BAD_REQUEST' | 'DB_ERROR' | 'NOT_FOUND' };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StudentsResponse>
) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  const { orgId, page, pageSize, q, sort } = parsed.data;

  // Ensure requester is an admin/manager in this org
  const { data: me, error: mErr } = await supabase
    .from('institution_members')
    .select('org_id, role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (mErr) return res.status(500).json({ ok: false, error: mErr.message, code: 'DB_ERROR' });
  if (!me || !['owner', 'admin', 'manager'].includes((me as any).role)) {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // We assume a view `institution_students_summary` keyed by (org_id, user_id)
  let query = supabase
    .from<StudentRow>('institution_students_summary')
    .select('user_id, full_name, email, joined_at, latest_band, attempts_count', { count: 'exact' })
    .eq('org_id', orgId);

  if (q && q.length > 1) {
    query = query.or([`full_name.ilike.%${q}%`, `email.ilike.%${q}%`].join(','));
  }

  query = sort === 'name'
    ? query.order('full_name', { ascending: true, nullsFirst: true })
    : query.order('joined_at', { ascending: false, nullsFirst: false });

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ ok: false, error: error.message, code: 'DB_ERROR' });

  const items: StudentCard[] = (data ?? []).map((s) => ({
    userId: s.user_id,
    name: s.full_name ?? 'Student',
    email: s.email ?? null,
    joinedAt: s.joined_at ?? undefined,
    latestBand: s.latest_band ?? undefined,
    attempts: s.attempts_count ?? undefined,
  }));

  return res.status(200).json({ ok: true, items, page, pageSize, total: count ?? 0 });
}
