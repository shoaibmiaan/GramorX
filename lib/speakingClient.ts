// lib/speakingClient.ts
export async function uploadSpeakingBlob(
  blob: Blob,
  ctx: 'p1' | 'p2' | 'p3' | 'chat',
  attemptId?: string
) {
  const fd = new FormData();
  fd.append('file', blob, `audio-${Date.now()}.webm`);
  fd.append('context', ctx);
  if (attemptId) fd.append('attemptId', attemptId);

  const r = await fetch('/api/speaking/upload', { method: 'POST', body: fd });
  if (!r.ok) {
    const msg = await r.text().catch(() => 'Upload failed');
    throw new Error(msg || 'Upload failed');
  }
  return (await r.json()) as { attemptId: string; path: string };
}
