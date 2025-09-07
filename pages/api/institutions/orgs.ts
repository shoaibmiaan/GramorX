// pages/api/institutions/orgs.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(12),
  q: z.string().trim().max(80).optional(),
  sort: z.enum(['new', 'name']).default('new'),
});

type OrgRow = {
  id: string;
  name: string;
  code: string | null;
  logo_url: string | null;
  created_at: string | null;
};

type OrgCard = {
  id: string;
  name: string;
  code?: string | null;
  logoUrl?: string | null;
  createdAt?: string | null;
};

type OrgsResponse =
  | { ok: true; items: OrgCard[]; page: number; pageSize: number; total: number }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'BAD_REQUEST' | 'DB_ERROR' };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OrgsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  // Authorization: user must be an institution admin/manager (members table)
  const { data: membership } = await supabase
    .from('institution_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1);

  const isAllowed = (membership ?? []).some(m => ['admin', 'manager', 'owner'].includes((m as any).role));
  if (!isAllowed) {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });

  const { page, pageSize, q, sort } = parsed.data;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from<OrgRow>('institutions').select('*', { count: 'exact' });

  if (q && q.length > 1) {
    query = query.or([`name.ilike.%${q}%`, `code.ilike.%${q}%`].join(','));
  }

  query = sort === 'name'
    ? query.order('name', { ascending: true })
    : query.order('created_at', { ascending: false });

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ ok: false, error: error.message, code: 'DB_ERROR' });

  const items: OrgCard[] = (data ?? []).map(o => ({
    id: o.id,
    name: o.name,
    code: o.code,
    logoUrl: o.logo_url ?? undefined,
    createdAt: o.created_at ?? undefined,
  }));

  return res.status(200).json({ ok: true, items, page, pageSize, total: count ?? 0 });
}
