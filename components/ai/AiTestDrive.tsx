import React, { useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Alert } from '@/components/design-system/Alert';

export const AiTestDrive: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setAnswer(null);
    if (!q.trim()) {
      setError('Please enter a one-line question.');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('/api/ai/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.trim() }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        setError(data?.error || 'Failed to get a response.');
      } else {
        setAnswer(data.answer);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={`card-surface p-6 rounded-ds-2xl ${className}`}>
      <h3 className="text-h3 font-semibold mb-2">⚡ Test the AI (2–3 lines)</h3>
      <p className="text-muted-foreground mb-4">Ask a quick question to see how the AI replies. This won’t affect your scores.</p>

      <form onSubmit={handleAsk} className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="e.g., How to improve coherence in Task 2?"
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Your question"
          maxLength={200}
          className="flex-1"
        />
        <Button type="submit" variant="primary" className="rounded-ds-xl" disabled={loading}>
          {loading ? 'Thinking…' : 'Ask'}
        </Button>
      </form>

      {error && (
        <Alert variant="error" className="mt-4" title="Couldn’t get an answer">
          {error}
        </Alert>
      )}

      {answer && (
        <div className="mt-4 p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
          <div className="whitespace-pre-line">{answer}</div>
        </div>
      )}
    </Card>
  );
};
