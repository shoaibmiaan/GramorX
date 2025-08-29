// pages/api/speaking/partner/review/[attemptId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const isUuid = (v: any) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const attemptId = req.query.attemptId as string | undefined;
  if (!isUuid(attemptId)) {
    return res.status(400).json({ error: 'Invalid attemptId (must be UUID)' });
  }

  const supabase = createSupabaseServerClient({ serviceRole: true });

  // Fetch latest feedback and transcript for this attempt
  // Table names used here:
  //   - sp_partner_feedback(attempt_id uuid, feedback text, created_at timestamptz)
  //   - sp_partner_transcripts(attempt_id uuid, transcript text, created_at timestamptz)
  // Adjust if yours differ.
  const [{ data: fb, error: fbErr }, { data: tr, error: trErr }] = await Promise.all([
    supabase
      .from('sp_partner_feedback')
      .select('id, feedback, created_at')
      .eq('attempt_id', attemptId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('sp_partner_transcripts')
      .select('id, transcript, created_at')
      .eq('attempt_id', attemptId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (fbErr && fbErr.code !== 'PGRST116') {
    // PGRST116 = no rows; treat as empty
    return res.status(500).json({ error: fbErr.message || 'Feedback fetch failed' });
  }
  if (trErr && trErr.code !== 'PGRST116') {
    return res.status(500).json({ error: trErr.message || 'Transcript fetch failed' });
  }

  return res.status(200).json({
    attemptId,
    feedback: fb?.feedback ?? null,
    transcript: tr?.transcript ?? null,
    feedbackAt: fb?.created_at ?? null,
    transcriptAt: tr?.created_at ?? null,
  });
}
