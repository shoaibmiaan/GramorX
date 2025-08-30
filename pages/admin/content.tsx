import Head from 'next/head';
import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { Container } from '@/components/design-system/Container';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { trackUsage, trackHeatmap } from '@/lib/analytics';

export default function AdminContentUpload() {
  const { upload, uploading, error } = useStorageUpload('content');
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    trackUsage('admin_content');
    trackHeatmap('admin_content');
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = await upload(file);
      setFileUrl(url);
    }
  }

  return (
    <AdminGuard>
      <Head><title>Admin · Content Upload</title></Head>
      <Container className="py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Upload Content</h1>
        <input type="file" onChange={handleFile} className="block" />
        {uploading && <p>Uploading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {fileUrl && (
          <p className="break-all">Uploaded URL: <a className="underline" href={fileUrl}>{fileUrl}</a></p>
        )}
      </Container>
    </AdminGuard>
  );
}
