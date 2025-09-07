// pages/api/content/delete.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  contentId: z.string().uuid(),
  deleteFile: z.boolean().default(true),
});

type DeleteResponse =
  | { ok: true; contentId: string }
  | { ok: false; error: string; code?: 'UNAUTHORIZED'|'FORBIDDEN'|'NOT_FOUND'|'BAD_REQUEST'|'DB_ERROR' };

const BUCKET = 'content';

export default async function handler(req: NextApiRequest, res: NextApiResponse<DeleteResponse>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  const { contentId, deleteFile } = parsed.data;

  const { data: item, error: iErr } = await supabase
    .from('content_items')
    .select('id, owner_id, file_path, status')
    .eq('id', contentId)
    .maybeSingle();

  if (iErr) return res.status(500).json({ ok: false, error: iErr.message, code: 'DB_ERROR' });
  if (!item) return res.status(404).json({ ok: false, error: 'Content not found', code: 'NOT_FOUND' });
  if (item.owner_id !== user.id) return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });

  // Soft delete DB row
  const { error: dErr } = await supabase.from('content_items').update({ status: 'deleted' }).eq('id', contentId);
  if (dErr) return res.status(500).json({ ok: false, error: dErr.message, code: 'DB_ERROR' });

  // Delete file (optional, best-effort)
  if (deleteFile && item.file_path) {
    await supabase.storage.from(BUCKET).remove([item.file_path]).catch(() => {});
  }

  return res.status(200).json({ ok: true, contentId });
}
