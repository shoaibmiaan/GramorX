import React from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

export function ShareLinkCard() {
  const [token, setToken] = React.useState<string | null>(null);
  const [link, setLink] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/progress/share', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        const base =
          process.env.NEXT_PUBLIC_BASE_URL ||
          (typeof window !== 'undefined' ? window.location.origin : '');
        setLink(`${base}/progress/${data.token}`);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // ignore
    }
  };

  return (
    <Card className="p-6 rounded-ds-2xl">
      <h2 className="font-slab text-h2 mb-4">Share progress</h2>
      {token ? (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 rounded border p-2 bg-transparent text-sm"
          />
          <Button onClick={copy} variant="secondary" className="rounded-ds-xl">
            Copy
          </Button>
        </div>
      ) : (
        <Button
          onClick={generate}
          variant="primary"
          className="rounded-ds-xl"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate link'}
        </Button>
      )}
    </Card>
  );
}

export default ShareLinkCard;
