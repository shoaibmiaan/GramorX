// pages/api/blog/moderate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export interface ModerateRequest {
  slug: string;
  action: 'approve' | 'reject';
  note?: string;
  admin_user_id?: string | null; // optional if you want to record the moderator
}
export interface ModerateResponse { ok: boolean; message?: string; errors?: Record<string,string>; }

function bad(res: NextApiResponse, code: number, message: string, errors?: Record<string,string>) {
  return res.status(code).json({ ok: false, message, ...(errors ? { errors } : {}) });
}
function validate(b: unknown): { ok: true; data: ModerateRequest } | { ok: false; errors: Record<string,string> } {
  const e: Record<string,string> = {};
  const x = b as Partial<ModerateRequest> | undefined;
  if (!x || typeof x !== 'object') return { ok: false, errors: { body: 'Invalid JSON' } };
  if (!x.slug || typeof x.slug !== 'string' || !/^[a-z0-9-]{3,100}$/.test(x.slug)) e.slug = 'Valid slug required';
  if (!x.action || (x.action !== 'approve' && x.action !== 'reject')) e.action = 'action must be approve|reject';
  if (x.admin_user_id != null && typeof x.admin_user_id !== 'string') e.admin_user_id = 'admin_user_id must be a string uuid.';
  if (Object.keys(e).length) return { ok: false, errors: e };
  return { ok: true, data: { slug: x.slug!, action: x.action!, note: (x.note ?? '').trim() || undefined, admin_user_id: x.admin_user_id ?? null } };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ModerateResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return bad(res, 405, 'Method Not Allowed');
  }
  // Admin gate
  if (!env.ADMIN_API_TOKEN || req.headers['x-admin-token'] !== env.ADMIN_API_TOKEN) {
    return bad(res, 403, 'Forbidden');
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return bad(res, 500, 'Server misconfigured.');

  const parsed = validate(req.body as unknown);
  if (!parsed.ok) return bad(res, 400, 'Validation failed', parsed.errors);

  const supa = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const now = new Date().toISOString();

  if (parsed.data.action === 'approve') {
    const { error } = await supa
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: now,
        moderated_at: now,
        moderated_by: parsed.data.admin_user_id ?? null,
        moderation_note: parsed.data.note ?? null,
      })
      .eq('slug', parsed.data.slug)
      .eq('status', 'submitted');

    if (error) return bad(res, 500, 'Failed to approve');
    return res.status(200).json({ ok: true, message: 'Approved & published.' });
  }

  // reject
  const { error } = await supa
    .from('blog_posts')
    .update({
      status: 'rejected',
      moderated_at: now,
      moderated_by: parsed.data.admin_user_id ?? null,
      moderation_note: parsed.data.note ?? null,
    })
    .eq('slug', parsed.data.slug)
    .eq('status', 'submitted');

  if (error) return bad(res, 500, 'Failed to reject');
  return res.status(200).json({ ok: true, message: 'Rejected.' });
}

export const config = { api: { bodyParser: { sizeLimit: '512kb' } } };
