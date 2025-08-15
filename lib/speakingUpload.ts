// lib/speakingUpload.ts
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export type SpeakingCtx = 'p1' | 'p2' | 'p3' | 'chat' | 'roleplay';

/** Upload an audio Blob with FormData, forwarding Supabase auth (Bearer + cookies). */
export async function uploadSpeakingBlob(
  blob: Blob,
  ctx: SpeakingCtx,
  attemptId?: string,
  extra?: Record<string, string | number | boolean | null | undefined>
): Promise<{ attemptId: string; path?: string }> {
  const fd = new FormData();
  fd.append('file', blob, `audio-${Date.now()}.webm`);
  fd.append('context', ctx);
  if (attemptId) fd.append('attemptId', attemptId);
  if (extra) for (const [k, v] of Object.entries(extra)) if (v != null) fd.append(k, String(v));

  const { data: { session } } = await supabaseBrowser.auth.getSession();
  const access = session?.access_token;

  const res = await fetch('/api/speaking/upload', {
    method: 'POST',
    body: fd,
    headers: access ? { Authorization: `Bearer ${access}` } : undefined,
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text().catch(() => 'Upload failed'));
  return (await res.json()) as { attemptId: string; path?: string };
}

export default uploadSpeakingBlob;
