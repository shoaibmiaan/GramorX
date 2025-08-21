import { env } from "@/lib/env";
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'node:fs/promises';
import pathMod from 'node:path';
import { supabaseFromRequest } from '@/lib/apiAuth';

export const config = { api: { bodyParser: false, sizeLimit: '25mb' } };

function parseForm(req: NextApiRequest) {
  const form = formidable({ multiples: false, maxFileSize: 25 * 1024 * 1024 });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) =>
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })))
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = supabaseFromRequest(req);
  const bucket = env.SPEAKING_BUCKET || 'speaking';

  try {
    const { fields, files } = await parseForm(req);
    const attemptId = String(fields.attemptId || '');
    const context = String(fields.context || fields.part || 'p1'); // p1|p2|p3
    const storagePath = String(fields.path || '');

    if (!attemptId || !storagePath) {
      return res.status(400).json({ error: 'Missing attemptId or path' });
    }

    const file = (files.file as File) ?? null;
    if (!file || !file.filepath) return res.status(400).json({ error: 'Missing file' });

    const fileBuf = await fs.readFile(file.filepath);
    const contentType =
      (file.mimetype as string | undefined) ||
      (file.originalFilename ? mimeFromName(file.originalFilename) : 'audio/webm');

    // Upload to Storage (upsert = true lets user retry)
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuf, { upsert: true, contentType });

    if (upErr) return res.status(400).json({ error: upErr.message });

    // Record clip row (path is NOT NULL in your schema)
    const bytes = fileBuf.byteLength;
    const filename = pathMod.basename(storagePath);

    const { data: clip, error: insErr } = await supabase
      .from('speaking_clips')
      .insert({
        attempt_id: attemptId,
        part: context,
        path: storagePath,
        mime: contentType,
        bytes,
        filename,
      })
      .select('id, path')
      .single();

    if (insErr) return res.status(400).json({ error: insErr.message });

    return res.status(200).json({ path: clip.path, clipId: clip.id });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Upload failed' });
  }
}

function mimeFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'mp3') return 'audio/mpeg';
  if (ext === 'wav') return 'audio/wav';
  if (ext === 'm4a') return 'audio/mp4';
  if (ext === 'ogg') return 'audio/ogg';
  if (ext === 'webm') return 'audio/webm';
  return 'application/octet-stream';
}
