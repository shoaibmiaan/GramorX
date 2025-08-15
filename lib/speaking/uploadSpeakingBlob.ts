// lib/speaking/uploadSpeakingBlob.ts
export async function uploadSpeakingBlob(
  blob: Blob,
  part: 'p1'|'p2'|'p3',
  promptHint?: string        // optional hint for transcription (topic/keywords)
): Promise<{ transcript: string; scores: {
  fluency: number; lexical: number; grammar: number; pronunciation: number; overall: number; feedback: string;
} }> {
  const arrayBuf = await blob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
  const mime = blob.type || 'audio/webm';

  const r = await fetch('/api/speaking/score-audio-groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64: base64, mime, part, promptHint }),
  });

  if (!r.ok) throw new Error(`Upload/score failed: ${r.status}`);
  return r.json();
}
