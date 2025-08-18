// lib/signedUrl.ts
import { authHeaders } from '@/lib/supabaseBrowser';

export function needsSigning(u?: string | null) {
  if (!u) return false;
  if (u.startsWith('blob:')) return false;
  if (/^https?:\/\//i.test(u)) {
    // already signed or public
    if (u.includes('/object/sign/') || u.includes('token=')) return false;
    // If it's not a Supabase storage URL, just use it
    if (!u.includes('/storage/v1/object/')) return false;
  }
  // bucket/object, bucket:path, or unsign storage URL
  return true;
}

export async function getSignedPlaybackUrl(opts: { clipId?: string; attemptId?: string; path?: string; src?: string | null }) {
  const { clipId, attemptId } = opts;
  const path = (opts.path ?? opts.src ?? '') as string;

  if (!needsSigning(path)) return path || '';

  const headers = await authHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch('/api/speaking/signed-url', {
    method: 'POST',
    headers,
    body: JSON.stringify({ clipId, attemptId, path }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'sign failed');
  return json.url as string;
}
