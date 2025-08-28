import React, { useState } from 'react';
import { Button } from '@/components/design-system/Button';

export type ChallengeProps = {
  attemptId: string;
  type: 'writing' | 'speaking';
};

export const ChallengeScore: React.FC<ChallengeProps> = ({ attemptId, type }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ justification: string; evidence: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scores/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, type }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Request failed');
      }
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Button onClick={runChallenge} disabled={loading} variant="secondary" className="rounded-ds-xl">
        {loading ? 'Checking…' : 'Challenge the Grade'}
      </Button>
      {error && <p className="text-sunsetOrange text-small mt-2">{error}</p>}
      {result && (
        <div className="mt-4 p-4 rounded-ds border border-gray-200 dark:border-white/10">
          <p className="font-medium">{result.justification}</p>
          {Array.isArray(result.evidence) && result.evidence.length > 0 && (
            <ul className="list-disc list-inside mt-2 space-y-1">
              {result.evidence.map((snip: string, i: number) => (
                <li key={i} className="text-sm">
                  {snip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengeScore;

