// pages/api/blog/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export interface BlogSubmitRequest {
  slug: string;               // draft slug to submit
  author_user_id?: string | null; // optional (for record-keeping)
}
export interface BlogSubmitResponse { ok: boolean; message?: string; errors?: Record<string,string>; }

function bad(res: NextApiResponse, code: number, message: string, errors?: Record<string,string>) {
  return res.status(code).json({ ok: false, message, ...(errors ? { errors } : {}) });
}

function validate(b: unknown): { ok: true; data: BlogSubmitRequest } | { ok: false; errors: Record<string,string> } {
  const e: Record<string,string> = {};
  const x = b as Partial<BlogSubmitRequest> | undefined;
  if (!x || typeof x !== 'object') return { ok: false, errors: { body: 'Invalid JSON' } };
  if (!x.slug || typeof x.slug !== 'string' || !/^[a-z0-9-]{3,100}$/.test(x.slug)) e.slug = 'Valid slug required';
  if (x.author_user_id != null && typeof x.author_user_id !== 'string') e.author_user_id = 'author_user_id must be a string uuid.';
  if (Object.keys(e).length) return { ok: false, errors: e };
  return { ok: true, data: { slug: x.slug!, author_user_id: x.author_user_id ?? null } };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<BlogSubmitResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return bad(res, 405, 'Method Not Allowed');
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return bad(res, 500, 'Server misconfigured.');

  const parsed = validate(req.body as unknown);
  if (!parsed.ok) return bad(res, 400, 'Validation failed', parsed.errors);

  const supa = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // Move draft -> submitted (only if currently 'draft' or 'rejected')
  const { error } = await supa
    .from('blog_posts')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      author_user_id: parsed.data.author_user_id ?? null,
    })
    .eq('slug', parsed.data.slug)
    .in('status', ['draft', 'rejected']);

  if (error) return bad(res, 500, 'Failed to submit for approval');
  return res.status(200).json({ ok: true, message: 'Submitted for admin review.' });
}

export const config = { api: { bodyParser: { sizeLimit: '256kb' } } };
