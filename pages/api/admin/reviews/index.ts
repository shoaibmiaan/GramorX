import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { requireRole } from '@/lib/requireRole';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // needs RLS-bypass (server only)
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    await requireRole(req, ['teacher', 'admin']);
  } catch {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }

  const attemptId = typeof req.query.attemptId === 'string' ? req.query.attemptId : null;

  try {
    if (attemptId) {
      // Detail view
      const { data, error } = await supabase
        .from('attempts_view_admin') // create a VIEW with joined fields you need
        .select('*')
        .eq('id', attemptId)
        .single();

      if (error) throw error;
      return res.json({ ok: true, data });
    }

    // List view
    const { data, error } = await supabase
      .from('attempts_list_admin') // smaller VIEW for table performance
      .select('*')
      .order('last_activity', { ascending: false })
      .limit(200);

    if (error) throw error;
    return res.json({ ok: true, data });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message ?? 'Server error' });
  }
}
