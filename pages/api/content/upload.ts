// pages/api/content/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  kind: z.enum(['reading_paper', 'listening_test', 'writing_prompt', 'speaking_set', 'lesson']),
  metadata: z.record(z.any()).optional(), // duration, level, tags etc.
  fileName: z.string().trim().min(3).max(180),
  fileType: z.string().trim().max(120).optional(), // mime
  sizeBytes: z.number().int().positive().max(1024 * 1024 * 1024).optional(),
});

type UploadInitResponse =
  | { ok: true; contentId: string; uploadUrl: string; storagePath: string }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'BAD_REQUEST' | 'DB_ERROR' };

const BUCKET = 'content';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadInitResponse>
) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  // Optional: check role (teacher/admin)
  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  const role = (me as any)?.role ?? 'student';
  if (!['teacher', 'admin'].includes(role)) {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });

  const { title, kind, metadata, fileName } = parsed.data;

  // Create DB row first
  const { data: created, error: cErr } = await supabase
    .from('content_items')
    .insert({
      owner_id: user.id,
      title,
      kind,
      metadata_json: metadata ?? {},
      status: 'draft',
    })
    .select('id')
    .single();

  if (cErr) return res.status(500).json({ ok: false, error: cErr.message, code: 'DB_ERROR' });

  const contentId = created!.id as string;
  const storagePath = `${user.id}/${contentId}/${fileName}`;

  // Create a signed upload URL (if using service-role server; otherwise use client policy)
  const { data: signed, error: sErr } = await supabase
    .storage
    .from(BUCKET)
    // @ts-expect-error Supabase JS types sometimes lack createSignedUploadUrl
    .createSignedUploadUrl(storagePath, 60 * 10); // 10 min

  if (sErr) return res.status(500).json({ ok: false, error: sErr.message, code: 'DB_ERROR' });

  return res.status(200).json({
    ok: true,
    contentId,
    uploadUrl: (signed as any).signedUrl ?? (signed as any).url,
    storagePath,
  });
}
