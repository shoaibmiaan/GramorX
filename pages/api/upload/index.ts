// pages/api/upload/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const config = { api: { bodyParser: false, sizeLimit: '30mb' } };

function parseForm(req: NextApiRequest) {
  const form = formidable({ multiples: false, maxFileSize: 30 * 1024 * 1024 });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) =>
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })))
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(URL, ANON, {
    global: { headers: { Cookie: req.headers.cookie || '' } },
    auth: { persistSession: false },
  });

  try {
    // Auth required
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { files } = await parseForm(req);
    const file = (files.file as File) ?? null;
    if (!file || !file.filepath) return res.status(400).json({ error: 'Missing file' });

    const buf = await fs.readFile(file.filepath);
    const contentType =
      (file.mimetype as string | undefined) ||
      mimeFromName(file.originalFilename || '') ||
      'audio/webm';

    const ext = guessExt(contentType, file.originalFilename || '');
    const key = path.posix.join('uploads', user.id, `${Date.now()}.${ext}`);
    const bucket = 'speaking-audio'; // keep aligned with other APIs

    const { error: upErr } = await supabaseAdmin.storage
      .from(bucket)
      .upload(key, buf, { contentType, upsert: true });

    if (upErr) return res.status(400).json({ error: upErr.message });

    // Temporary signed URL for scorers
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(key, 60 * 60); // 1 hour

    if (signErr || !signed?.signedUrl) {
      return res.status(400).json({ error: signErr?.message || 'Could not sign URL' });
    }

    return res.status(200).json({
      ok: true,
      path: key,
      fileUrl: signed.signedUrl,
      contentType,
      bytes: buf.byteLength,
    });
  } catch (e: any) {
    console.error(e);
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
  return null;
}

function guessExt(mime: string, name: string) {
  if (/mpeg/.test(mime) || /\.mp3$/i.test(name)) return 'mp3';
  if (/wav/.test(mime) || /\.wav$/i.test(name)) return 'wav';
  if (/ogg/.test(mime) || /\.ogg$/i.test(name)) return 'ogg';
  if (/mp4/.test(mime) || /\.m4a$/i.test(name)) return 'm4a';
  return 'webm';
}
