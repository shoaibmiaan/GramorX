// pages/api/speaking/signed-url.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!; // <-- add to env (server only)

// Server client for storage signing + DB auth checks
const svc = createClient(URL, SERVICE, { auth: { persistSession: false } });

// Helper to get the authed user from cookie or Bearer
function authClient(req: NextApiRequest) {
  const headers: Record<string, string> = {};
  if (req.headers.authorization) headers['Authorization'] = String(req.headers.authorization);
  return createClient(URL, ANON, { global: { headers }, auth: { persistSession: false } });
}

// Parse bucket/object from various inputs
function parseStoragePath(input: string): { bucket: string; object: string } | { alreadySignedUrl: string } {
  if (!input) throw new Error('Missing path');
  if (input.startsWith('blob:')) return { alreadySignedUrl: input };
  if (/^https?:\/\//i.test(input)) {
    // https://.../storage/v1/object/{public|private|sign}/<bucket>/<object>[?token=...]
    const u = new URL(input);
    const i = u.pathname.indexOf('/storage/v1/object/');
    if (i === -1) return { alreadySignedUrl: input };
    const rest = u.pathname.slice(i + '/storage/v1/object/'.length);
    const parts = rest.split('/'); // [public|private|sign, bucket, ...object]
    const kind = parts.shift();
    if (kind === 'sign' || u.searchParams.has('token')) return { alreadySignedUrl: input };
    const bucket = parts.shift();
    if (!bucket || parts.length === 0) throw new Error('Unrecognized storage URL');
    return { bucket, object: parts.join('/') };
  }
  // "bucket:object" or "bucket/object"
  const colon = input.indexOf(':');
  if (colon !== -1) {
    const bucket = input.slice(0, colon);
    const object = input.slice(colon + 1).replace(/^\/+/, '');
    if (!bucket || !object) throw new Error('Invalid bucket:path');
    return { bucket, object };
  }
  const slash = input.indexOf('/');
  if (slash !== -1) {
    const bucket = input.slice(0, slash);
    const object = input.slice(slash + 1);
    if (!bucket || !object) throw new Error('Invalid bucket/object');
    return { bucket, object };
  }
  throw new Error('Provide path as bucket/object, bucket:path, or a storage URL');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Inputs
    const body = req.method === 'POST' ? req.body ?? {} : {};
    const path = String((req.query.path as string) ?? body.path ?? '');
    const clipId = String((req.query.clipId as string) ?? body.clipId ?? '');
    const attemptId = String((req.query.attemptId as string) ?? body.attemptId ?? '');
    const expiresIn = Number((req.query.expiresIn as string) ?? body.expiresIn ?? 900); // default 15m

    // Require auth (cookie or Bearer)
    const authed = authClient(req);
    const { data: userData } = await authed.auth.getUser();
    const user = userData?.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Resolve secure source: by clipId, or by (attemptId + path), or by path only (last option)
    let finalPath = path;

    if (clipId) {
      const { data: clip, error: cErr } = await svc
        .from('speaking_clips')
        .select('attempt_id,audio_url')
        .eq('id', clipId)
        .single();
      if (cErr || !clip) return res.status(404).json({ error: 'Clip not found' });

      const { data: attempt, error: aErr } = await svc
        .from('speaking_attempts')
        .select('user_id')
        .eq('id', clip.attempt_id)
        .single();
      if (aErr || !attempt) return res.status(404).json({ error: 'Attempt not found' });
      if (attempt.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });

      finalPath = finalPath || clip.audio_url;
    } else if (attemptId) {
      const { data: attempt, error: aErr } = await svc
        .from('speaking_attempts')
        .select('user_id')
        .eq('id', attemptId)
        .single();
      if (aErr || !attempt) return res.status(404).json({ error: 'Attempt not found' });
      if (attempt.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });
      if (!finalPath) return res.status(400).json({ error: 'path required with attemptId' });
    } else {
      // Path only — allow if it looks like a signed URL already; otherwise block to avoid abuse
      const quick = parseStoragePath(finalPath);
      if ('alreadySignedUrl' in quick) {
        return res.status(200).json({ url: quick.alreadySignedUrl });
      }
      return res.status(400).json({ error: 'Provide clipId or attemptId with path' });
    }

    const parsed = parseStoragePath(finalPath);
    if ('alreadySignedUrl' in parsed) {
      return res.status(200).json({ url: parsed.alreadySignedUrl });
    }

    const { bucket, object } = parsed;
    const { data, error } = await svc.storage.from(bucket).createSignedUrl(object, expiresIn);
    if (error || !data?.signedUrl) {
      return res.status(400).json({ error: error?.message || 'Could not sign URL' });
    }

    // Tight cache headers (client can re-fetch when it expires)
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    return res.status(200).json({ url: data.signedUrl });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}
