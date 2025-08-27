// components/speaking/AccentMirror.tsx
import React, { useEffect, useState } from 'react';
import { Accent } from './AccentPicker';
import MinimalPairs from './MinimalPairs';

type AccentData = {
  prompts: string[];
  gaps: [string, string][];
};

export const AccentMirror: React.FC<{ accent: Accent }> = ({ accent }) => {
  const [data, setData] = useState<AccentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/speaking/accent-mirror?accent=${accent}`);
        if (!res.ok) throw new Error('Failed to load prompts');
        const json: AccentData = await res.json();
        if (!ignore) setData(json);
      } catch (e: any) {
        if (!ignore) setError(e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [accent]);

  if (loading) return <p>Loading prompts...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Alignment Prompts</h3>
        <ul className="list-disc pl-5 space-y-1">
          {data.prompts.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Gap Words</h3>
        <MinimalPairs pairs={data.gaps} />
      </div>
    </div>
  );
};

export default AccentMirror;
