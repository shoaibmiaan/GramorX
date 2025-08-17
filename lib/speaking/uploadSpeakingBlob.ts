// lib/speaking/uploadSpeakingBlob.ts
import { authHeaders } from '@/lib/supabaseBrowser';

export async function uploadSpeakingBlob(
  blob: Blob,
  ctx: 'p1' | 'p2' | 'p3' | 'chat',
  attemptId?: string
) {
  const fd = new FormData();
  fd.append('file', blob, `speaking-${ctx}-${Date.now()}.webm`);
  if (attemptId) fd.append('attemptId', attemptId);
  fd.append('ctx', ctx);

  const headers = await authHeaders();
  const res = await fetch('/api/speaking/upload', {
    method: 'POST',
    headers,
    body: fd,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Upload failed: ${res.status} ${msg}`);
  }
  return res.json();
}
