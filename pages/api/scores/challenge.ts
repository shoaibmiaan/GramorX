import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';

const BodySchema = z.object({
  attemptId: z.string().uuid(),
  type: z.enum(['writing', 'speaking']),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid body', details: parse.error.flatten() });
  const { attemptId, type } = parse.data;

  const supabase = createServerSupabaseClient({ req, res });
  const { data: userResp, error: authErr } = await supabase.auth.getUser();
  if (authErr || !userResp?.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = userResp.user.id;

  try {
    let text: string | null = null;
    if (type === 'writing') {
      const { data, error } = await supabase
        .from('writing_attempts')
        .select('essay_text, user_id')
        .eq('id', attemptId)
        .single();
      if (error || !data) return res.status(404).json({ error: 'Attempt not found' });
      if (data.user_id && data.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });
      text = data.essay_text;
    } else {
      const { data, error } = await supabase
        .from('speaking_attempts')
        .select('transcript, user_id')
        .eq('id', attemptId)
        .single();
      if (error || !data) return res.status(404).json({ error: 'Attempt not found' });
      if (data.user_id && data.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });
      text = data.transcript;
    }

    if (!text) return res.status(400).json({ error: 'No text available for challenge' });

    const snippet = text.slice(0, 200);
    const justification = `According to IELTS rubric, the score is justified. Example evidence: "${snippet}"`;

    return res.status(200).json({ justification, evidence: [snippet] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}

