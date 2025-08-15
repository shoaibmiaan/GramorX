import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files, File as FormidableFile } from 'formidable';
import fs from 'node:fs/promises';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

export const config = { api: { bodyParser: false, sizeLimit: '30mb' } };

// ---------- utils ----------
function first<T>(v: T | T[] | undefined | null): T | undefined {
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}
function parseForm(req: NextApiRequest) {
  const form = formidable({ multiples: false, keepExtensions: true, maxFileSize: 30 * 1024 * 1024 });
  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}
function makeUserClient(authHeader?: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, {
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
  });
}
function makeAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!svc) return null;
  return createClient(url, svc);
}

const BUCKET = process.env.SPEAKING_BUCKET || 'speaking-clips';

async function ensureBucket(admin: SupabaseClient, bucket: string) {
  const { error } = await admin.storage.createBucket(bucket, {
    public: false,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wav'],
  });
  if (error && !/already exists|exists/i.test(error.message)) throw error;
}

function extFromMime(m: string | undefined) {
  if (!m) return 'bin';
  if (m.includes('webm')) return 'webm';
  if (m.includes('ogg'))  return 'ogg';
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
  if (m.includes('wav'))  return 'wav';
  return 'bin';
}
function sanitizeName(s: string) {
  return s.replace(/[^a-zA-Z0-9._/-]+/g, '-').replace(/-+/g, '-');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let tmpPath: string | undefined;

  try {
    const { fields, files } = await parseForm(req);

    const file = first<FormidableFile>(files.file as any);
    if (!file) return res.status(400).json({ error: 'file missing' });

    const attemptId = String(first(fields.attemptId) || '').trim();
    const context = String(first(fields.context) || '').trim(); // 'p1' | 'p2' | 'p3'
    // Accept multiple aliases from client:
    const rawPath =
      String(first(fields.path) || '') ||
      String(first(fields.filePath) || '') ||
      String(first(fields.storagePath) || '');

    // read uploaded temp file
    // @ts-ignore - formidable v2/v3 differences
    tmpPath = (file as any).filepath || (file as any).path;
    const buffer = await fs.readFile(tmpPath);
    const contentType = file.mimetype || 'audio/webm';
    const origName = (file.originalFilename || `clip.${extFromMime(contentType)}`).toString();

    if (!attemptId) return res.status(400).json({ error: 'attemptId missing' });

    // If client didn't pass a path, auto-generate one safely
    const generated = `attempts/${attemptId}/${context || 'p'}/${Date.now()}-${crypto
      .randomBytes(4)
      .toString('hex')}.${extFromMime(contentType)}`;
    const storagePath = sanitizeName((rawPath || '').trim() || generated);

    const userSb = makeUserClient(req.headers.authorization as string | undefined);

    // --- 1) Upload to Storage
    let upErr: any = null;
    let upData: any = null;
    try {
      const r = await userSb.storage.from(BUCKET).upload(storagePath, buffer, { contentType, upsert: true });
      upErr = r.error; upData = r.data;
    } catch (e) {
      upErr = e;
    }

    // If bucket missing → create via admin then retry
    if (upErr && /Not Found|bucket.*not.*found|does not exist|404/i.test(String(upErr?.message ?? upErr))) {
      const admin = makeAdminClient();
      if (!admin) {
        return res.status(500).json({ error: `storage upload failed: bucket "${BUCKET}" not found (set SPEAKING_BUCKET and SUPABASE_SERVICE_ROLE_KEY to auto-create)` });
      }
      await ensureBucket(admin, BUCKET);
      const r2 = await admin.storage.from(BUCKET).upload(storagePath, buffer, { contentType, upsert: true });
      if (r2.error) return res.status(500).json({ error: `storage upload failed after create: ${r2.error.message}` });
      upData = r2.data;
      upErr = null;
    }
    if (upErr) {
      return res.status(500).json({ error: `storage upload failed (bucket: ${BUCKET}): ${upErr.message || upErr}` });
    }

    // --- 2) Insert DB row with NOT NULL path
    const insertRow: Record<string, any> = {
      attempt_id: attemptId,
      part: context || null,
      path: storagePath,                  // <-- guaranteed non-null now
      mime: contentType,
      size_bytes: buffer.byteLength,
      original_name: origName,
    };

    let insErr: any = null;
    let ins: any = null;
    try {
      const r = await userSb.from('speaking_clips').insert(insertRow).select('*').single();
      insErr = r.error; ins = r.data;
    } catch (e) {
      insErr = e;
    }

    if (insErr) {
      const admin = makeAdminClient();
      if (!admin) return res.status(500).json({ error: `db insert failed: ${insErr.message || insErr}` });
      const r = await admin.from('speaking_clips').insert(insertRow).select('*').single();
      if (r.error) return res.status(500).json({ error: `db insert failed (admin): ${r.error.message}` });
      ins = r.data;
    }

    return res.status(200).json({
      ok: true,
      clipId: ins?.id ?? null,
      id: ins?.id ?? null,
      path: storagePath,
      bucket: BUCKET,
      contentType,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'upload error' });
  } finally {
    if (tmpPath) { try { await fs.unlink(tmpPath); } catch {} }
  }
}
