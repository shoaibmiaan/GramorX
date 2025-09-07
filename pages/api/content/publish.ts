// pages/api/content/publish.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  contentId: z.string().uuid(),
  visibility: z.enum(['private', 'org', 'public']).default('private'),
  publishAtUtc: z.string().datetime().optional(),
});

type PublishResponse =
  | { ok: true; contentId: string; status: 'published' | 'scheduled'; publicUrl?: string }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'BAD_REQUEST' | 'DB_ERROR' };

const BUCKET = 'content';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublishResponse>
) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  const { contentId, visibility, publishAtUtc } = parsed.data;

  // Load content & authorize
  const { data: item, error: iErr } = await supabase
    .from('content_items')
    .select('id, owner_id, status, file_path, kind')
    .eq('id', contentId)
    .maybeSingle();

  if (iErr) return res.status(500).json({ ok: false, error: iErr.message, code: 'DB_ERROR' });
  if (!item) return res.status(404).json({ ok: false, error: 'Content not found', code: 'NOT_FOUND' });
  if (item.owner_id !== user.id) return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });

  // Ensure file is uploaded
  if (!item.file_path) {
    return res.status(400).json({ ok: false, error: 'Upload file before publishing', code: 'BAD_REQUEST' });
  }

  // Visibility handling
  let publicUrl: string | undefined;
  if (visibility === 'public') {
    // Make object public or create a long-lived signed URL
    const { data: pub, error: pErr } = await supabase.storage.from(BUCKET).getPublicUrl(item.file_path);
    if (pErr) return res.status(500).json({ ok: false, error: pErr.message, code: 'DB_ERROR' });
    publicUrl = (pub as any).publicUrl;
  }

  // Schedule vs immediate
  const status = publishAtUtc ? 'scheduled' : 'published';
  const { error: uErr } = await supabase
    .from('content_items')
    .update({
      status,
      visibility,
      published_at_utc: publishAtUtc ?? new Date().toISOString(),
      public_url: publicUrl ?? null,
    })
    .eq('id', contentId);

  if (uErr) return res.status(500).json({ ok: false, error: uErr.message, code: 'DB_ERROR' });

  return res.status(200).json({ ok: true, contentId, status: status as 'published' | 'scheduled', publicUrl });
}
