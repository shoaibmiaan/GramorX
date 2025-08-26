// pages/api/admin/students/list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/requireRole';

type Row = {
  id: string;
  name: string;
  email: string;
  cohort?: string | null;
  role?: string | null;
  joinedAt: string;
  is_disabled?: boolean;
};

type Resp = {
  rows: Row[];
  total: number;
  page: number;
  size: number;
  cohorts: string[];
  roles: string[];
};

function ymdToIsoStart(ymd: string) { return `${ymd}T00:00:00.000Z`; }
function ymdToIsoEnd(ymd: string)   { return `${ymd}T23:59:59.999Z`; }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp | {error:string}>) {
  try {
    await requireRole(req, ['admin']);
  } catch {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { from, to, q, cohort, role, status, page='1', size='20' } = req.query as Record<string,string|undefined>;
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const sizeNum = Math.min(100, Math.max(5, parseInt(size || '20', 10)));

    const fromIso = ymdToIsoStart(from || '1970-01-01');
    const toIso = ymdToIsoEnd(to || '2100-01-01');

    // Build query on profiles
    let sel = supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, created_at, cohort, role, is_disabled', { count: 'exact' })
      .gte('created_at', fromIso)
      .lte('created_at', toIso);

    if (q && q.trim()) {
      sel = sel.or(`full_name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`);
    }
    if (cohort && cohort !== 'All') sel = sel.eq('cohort', cohort);
    if (role && role !== 'All') sel = sel.eq('role', role);
    if (status && status !== 'All') {
      if (status === 'Disabled') sel = sel.eq('is_disabled', true);
      if (status === 'Active') sel = sel.or('is_disabled.is.null,is_disabled.eq.false');
    }

    sel = sel.order('created_at', { ascending: false });

    const start = (pageNum - 1) * sizeNum;
    const end = start + sizeNum - 1;

    const [{ data, count, error }, cohortsDistinct, rolesDistinct] = await Promise.all([
      sel.range(start, end),
      supabaseAdmin.from('profiles').select('cohort').not('cohort','is',null).neq('cohort','').returns<any[]>(),
      supabaseAdmin.from('profiles').select('role').not('role','is',null).neq('role','').returns<any[]>(),
    ]);

    if (error) throw error;

    const rows: Row[] = (data ?? []).map((u: any) => ({
      id: String(u.id),
      name: u.full_name || '—',
      email: u.email || '—',
      cohort: u.cohort ?? null,
      role: u.role ?? null,
      is_disabled: !!u.is_disabled,
      joinedAt: new Date(u.created_at).toLocaleString(),
    }));

    const cohorts = Array.from(new Set((cohortsDistinct.data ?? []).map((x:any)=>x.cohort))).filter(Boolean);
    const roles = Array.from(new Set((rolesDistinct.data ?? []).map((x:any)=>x.role))).filter(Boolean);

    res.status(200).json({
      rows,
      total: count ?? rows.length,
      page: pageNum,
      size: sizeNum,
      cohorts,
      roles: roles.length ? roles : ['student','teacher','admin'],
    });
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
}
