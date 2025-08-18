// /lib/speaking/uploadSpeakingBlob.ts
import { supabaseBrowser } from '@/lib/supabaseBrowser';

/**
 * Uploads an audio blob to Supabase Storage and returns a signed URL.
 * Bucket: "speaking"   Path: speaking/<userId>/<attemptId>/<ctx>/<timestamp>.webm
 *
 * ctx: 'p1'|'p2'|'p3'|'chat'
 */
export async function uploadSpeakingBlob(
  blob: Blob,
  ctx: 'p1' | 'p2' | 'p3' | 'chat',
  attemptId: string
): Promise<string> {
  const { data: sess } = await supabaseBrowser.auth.getSession();
  const userId = sess.session?.user?.id;
  if (!userId) throw new Error('Unauthorized');

  const ts = Date.now();
  const path = `speaking/${userId}/${attemptId}/${ctx}/${ts}.webm`;

  const { data, error } = await supabaseBrowser.storage
    .from('speaking')
    .upload(path, blob, {
      contentType: 'audio/webm',
      upsert: false,
    });

  if (error) throw error;

  // Signed URL for playback in UI
  const { data: signed, error: signedErr } = await supabaseBrowser.storage
    .from('speaking')
    .createSignedUrl(data.path, 60 * 60 * 24); // 24h

  if (signedErr) throw signedErr;

  return signed.signedUrl;
}
