import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { data: tests, error } = await supabaseAdmin
    .from('listening_tests')
    .select('slug,title');

  if (error) return res.status(500).json({ error: error.message });

  // compute duration from sections (end_ms max)
  const out = [];
  for (const t of tests ?? []) {
    const { data: secs } = await supabaseAdmin
      .from('listening_sections')
      .select('start_ms,end_ms')
      .eq('test_slug', t.slug)
      .order('order_no');
    const durationMs = Math.max(0, Math.max(...(secs?.map(s => s.end_ms) ?? [0])) - Math.min(...(secs?.map(s => s.start_ms) ?? [0])));
    out.push({ slug: t.slug, title: t.title, duration: Math.round(durationMs/1000) });
  }

  res.json(out);
}
