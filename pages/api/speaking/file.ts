// pages/api/speaking/file.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { env } from '@/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const filePath = req.query.path as string;
  if (!filePath) return res.status(400).json({ error: 'Missing path' });

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, anon, {
    global: { headers: { Cookie: req.headers.cookie || '' } },
  });

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Path format: userId/attemptId/context/timestamp.ext
    const parts = filePath.split('/');
    if (parts.length < 2) return res.status(400).json({ error: 'Invalid path format' });
    const [ownerId, attemptId] = parts;

    if (ownerId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Verify attempt belongs to user
    const { data: attempt, error } = await supabaseAdmin
      .from('speaking_attempts')
      .select('id,user_id')
      .eq('id', attemptId)
      .single();

    if (error || !attempt || attempt.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Sign the URL
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from('speaking-audio')
      .createSignedUrl(filePath, 60); // 60 sec

    if (signErr || !signed?.signedUrl) {
      throw new Error(signErr?.message || 'Unable to sign URL');
    }

    return res.redirect(signed.signedUrl);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
