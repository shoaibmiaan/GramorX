// /lib/speaking/saveJsonToStorage.ts
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type SaveOptions = {
  attemptId: string;
  ctx: 'p1' | 'p2' | 'p3' | 'chat';
  filename: string; // e.g. "q1.feedback.json"
  data: unknown;
};

/**
 * Saves arbitrary JSON next to the user's speaking attempt in Supabase Storage.
 * Path: speaking/<userId>/<attemptId>/<ctx>/<filename>
 */
export async function saveJsonToStorage({ attemptId, ctx, filename, data }: SaveOptions) {
  const { data: sess } = await supabaseBrowser.auth.getSession();
  const userId = sess.session?.user?.id;
  if (!userId) throw new Error('Unauthorized');

  const path = `speaking/${userId}/${attemptId}/${ctx}/${filename}`;
  const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

  const { data: up, error } = await supabaseBrowser.storage
    .from('speaking')
    .upload(path, file, { upsert: true, contentType: 'application/json' });

  if (error) throw error;
  return up?.path ?? path;
}
