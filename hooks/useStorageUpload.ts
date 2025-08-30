import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export function useStorageUpload(bucket: string) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<string | null> {
    setUploading(true);
    setError(null);
    const path = `${Date.now()}-${file.name}`;
    const { data, error } = await supabaseBrowser.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (error) {
      setError(error.message);
      setUploading(false);
      return null;
    }
    const { data: signed } = await supabaseBrowser.storage
      .from(bucket)
      .createSignedUrl(data.path, 60 * 60 * 24);
    setUploading(false);
    return signed?.signedUrl ?? null;
  }

  return { upload, uploading, error };
}
