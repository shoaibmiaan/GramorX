// pages/api/speaking/attempt/update.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

type Body = {
  attemptId?: string;
  scenario?: string | null;   // slug for roleplay; null/omit for partner/simulator
  transcript?: string;        // full concatenated transcript
  mergeTranscript?: boolean;  // if true, append with newline instead of overwrite
};

type Ok = { attemptId: string; updated: boolean };
type Err = { error: string };

// Default non-null shape for JSONB column "parts"
const BASE_PARTS = { p1: null, p2: null, p3: null };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createServerSupabaseClient({ req, res });
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const { attemptId, scenario, transcript, mergeTranscript }: Body = req.body || {};

  // If attemptId provided, ensure ownership; else create a new attempt for this user
  const idFromBody = attemptId || '';
  if (idFromBody) {
    // --- UPDATE PATH ---
    const { data: found, error: findErr } = await supabase
      .from('speaking_attempts')
      .select('id,user_id,transcript')
      .eq('id', idFromBody)
      .single();

    if (findErr || !found) return res.status(404).json({ error: 'Attempt not found' });
    if (found.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });

    // Prepare update payload
    const update: Record<string, any> = {};

    if (typeof scenario !== 'undefined') {
      update.scenario = scenario || null;
    }

    if (typeof transcript === 'string') {
      if (mergeTranscript && found.transcript) {
        const merged = `${found.transcript}\n${transcript}`.trim();
        update.transcript = merged;
      } else {
        update.transcript = transcript;
      }
    }

    // Never accidentally null-out parts (paranoid guard if someone sends parts: null)
    if ('parts' in update && (update.parts == null || typeof update.parts !== 'object')) {
      delete update.parts;
    }

    if (Object.keys(update).length === 0) {
      return res.status(200).json({ attemptId: idFromBody, updated: false });
    }

    const { error: updErr } = await supabase
      .from('speaking_attempts')
      .update(update)
      .eq('id', idFromBody);

    if (updErr) return res.status(500).json({ error: 'Failed to update attempt' });

    return res.status(200).json({ attemptId: idFromBody, updated: true });
  }

  // --- CREATE PATH ---
  // Always include a non-null "parts" object to satisfy NOT NULL constraint.
  const insert: Record<string, any> = {
    user_id: user.id,
    parts: BASE_PARTS, // ✅ critical fix
  };

  if (typeof scenario !== 'undefined') insert.scenario = scenario || null;
  if (typeof transcript === 'string') insert.transcript = transcript;

  const { data: created, error: insErr } = await supabase
    .from('speaking_attempts')
    .insert(insert)     // supabase-js v2 accepts single-object inserts
    .select('id')
    .single();

  if (insErr || !created) {
    return res.status(500).json({ error: 'Failed to create attempt' });
  }

  return res.status(200).json({ attemptId: created.id, updated: true });
}
