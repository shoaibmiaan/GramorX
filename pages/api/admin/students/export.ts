// pages/api/admin/students/export.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/requireRole';

function ymdToIsoStart(ymd: string) { return `${ymd}T00:00:00.000Z`; }
function ymdToIsoEnd(ymd: string)   { return `${ymd}T23:59:59.999Z`; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireRole(req, ['admin']);
  } catch {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { from, to, q, cohort, role, status } = req.query as Record<string,string|undefined>;

    const fromIso = ymdToIsoStart(from || '1970-01-01');
    const toIso = ymdToIsoEnd(to || '2100-01-01');

    let sel = supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, created_at, cohort, role, is_disabled')
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

    const { data, error } = await sel.limit(50000);
    if (error) throw error;

    const rows = (data ?? []).map((u:any) => ({
      id: u.id,
      name: u.full_name || '',
      email: u.email || '',
      cohort: u.cohort || '',
      role: u.role || '',
      status: u.is_disabled ? 'Disabled' : 'Active',
      joinedAt: new Date(u.created_at).toISOString(),
    }));

    const header = ['id','name','email','cohort','role','status','joinedAt'];
    const csv = [
      header.join(','),
      ...rows.map(r => header.map(h => csvEscape((r as any)[h])).join(',')),
    ].join('\n');

    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Content-Disposition','attachment; filename="students_export.csv"');
    res.status(200).send(csv);
  } catch (e:any) {
    res.status(500).send(`error,${csvEscape(e.message)}`);
  }
}

function csvEscape(v: any) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`;
  return s;
}
