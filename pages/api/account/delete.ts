import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { purgeUserData } from '@/lib/gdpr';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient({ req });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      await purgeUserData(user.id);
      // remove auth user
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Deletion failed' });
    }
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
