// pages/api/speaking/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File as FormidableFile, Fields, Files } from 'formidable';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { getUserServer } from '@/lib/authServer';

export const config = { api: { bodyParser: false, sizeLimit: '25mb' } };

async function parseForm(req: NextApiRequest) {
  const form = formidable({ multiples: false, maxFileSize: 25 * 1024 * 1024 });
  return await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}
function pickFile(files: Files): FormidableFile | null {
  const maybe = (files as any).file ?? Object.values(files)[0];
  return Array.isArray(maybe) ? maybe[0] : (maybe as FormidableFile | null);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, supabaseDb } = await getUserServer(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized (no valid session token)' });

  try {
    const { fields, files } = await parseForm(req);
    const f = pickFile(files);
    if (!f) return res.status(400).json({ error: 'No file received (FormData key must be "file")' });
    const filepath = (f as any).filepath;
    if (!filepath) return res.status(400).json({ error: 'Temp filepath missing from parser' });

    const buf = await fs.readFile(filepath);
    const attemptId = crypto.randomUUID();
    const orig = (f as any).originalFilename || 'audio.webm';
    const ext = (orig.split('.').pop() || 'webm').toLowerCase();
    const objectPath = `${user.id}/${attemptId}.${ext}`;

    const up = await supabaseDb.storage.from('speaking-audio').upload(objectPath, buf, {
      contentType: (f as any).mimetype || 'audio/webm',
      upsert: false,
    });
    await fs.unlink(filepath).catch(() => {});
    if (up.error) return res.status(500).json({ error: `Storage: ${up.error.message}` });

    const ctx = String((fields as any).ctx || 'p1');
    const durationMs = Number((fields as any).durationMs || 0);
    const promptText = String((fields as any).prompt || '');
    const accentRaw  = String((fields as any).accent || '');
    const accent = ['UK','US','AUS'].includes(accentRaw) ? accentRaw : null;

    const ins = await supabaseDb
      .from('speaking_attempts')
      .insert({
        id: attemptId,
        user_id: user.id,
        part: ctx,
        duration_ms: durationMs,
        audio_path: up.data?.path || objectPath,
        prompt_text: promptText,
        accent,
      })
      .select('id, audio_path')
      .single();

    if (ins.error) return res.status(500).json({ error: `DB: ${ins.error.message}` });
    return res.status(200).json({ attemptId: ins.data.id, audioPath: ins.data.audio_path });
  } catch (e: any) {
    console.error('Upload failed:', e);
    return res.status(500).json({ error: e?.message || 'Upload failed' });
  }
}
