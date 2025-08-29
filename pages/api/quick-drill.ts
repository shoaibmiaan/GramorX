import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Simple placeholder drills for each skill
const DRILLS: Record<string, string> = {
  reading: 'Read the paragraph and answer the question: Why is practice important?',
  writing: 'Write three sentences about your favorite hobby.',
  listening: 'Listen to a short clip and jot down the main idea. (Coming soon)',
  speaking: 'Describe your hometown in 30 seconds.',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createSupabaseServerClient({ req });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let { skill } = req.query as { skill?: string };

  if (!skill) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('ai_recommendation')
      .eq('user_id', user.id)
      .maybeSingle();
    const seq: string[] =
      (profile?.ai_recommendation as any)?.sequence ?? [];
    skill = seq[0] || 'reading';
  }

  const exercise = DRILLS[skill] || DRILLS.reading;

  return res.status(200).json({ skill, exercise });
}
