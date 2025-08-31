// pages/api/admin/users/list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireRole } from '@/lib/requireRole';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface Row {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Row[] | { error: string }>
) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    await requireRole(req, ['admin']);
  } catch {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    const users = data?.users ?? [];
    const ids = users.map((u) => u.id);
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .in('id', ids);
    if (pErr) throw pErr;
    const map = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const rows: Row[] = users.map((u: any) => {
      const prof = map.get(u.id) || {};
      return {
        id: u.id,
        full_name: (prof.full_name as string) || null,
        email: u.email ?? null,
        role: (prof.role as string) || null,
        created_at: u.created_at ?? null,
        last_sign_in_at: u.last_sign_in_at ?? null,
      };
    });
    res.status(200).json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

