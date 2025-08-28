import React, { useState } from 'react';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Alert } from '@/components/design-system/Alert';

export const DrillGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/drills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setResult(data.text ?? 'No content produced.');
    } catch {
      setResult('Error generating drill. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Input
          label="Focus Area"
          placeholder="e.g., Reading — True/False/Not Given"
          value={topic}
          onChange={(e) => setTopic(e.currentTarget.value)}
        />
        <Button onClick={onGenerate} disabled={loading || !topic} variant="primary" className="self-end rounded-ds-xl">
          {loading ? 'Generating…' : 'Generate'}
        </Button>
      </div>

      {result && (
        <Card className="card-surface p-5 rounded-ds mt-6 whitespace-pre-wrap">
          {result}
        </Card>
      )}

      {!result && !loading && (
        <Alert variant="info" className="mt-4">
          Tip: Be specific, like “Writing Task 2 — advantages/disadvantages with education examples”.
        </Alert>
      )}
    </div>
  );
};
