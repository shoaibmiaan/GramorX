import React, { useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';

type Criteria = { task:number; coherence:number; lexical:number; grammar:number };

export const ReevalPanel: React.FC<{
  attemptId: string;
  original: { bandOverall:number; criteria: Criteria };
  onSaved?: (row: {
    id: string;
    created_at: string;
    band_overall: number;
    band_breakdown: Criteria;
    feedback: string;
    mode: string;
    focus: string[];
  }) => void;
}> = ({ attemptId, original, onSaved }) => {
  const [mode, setMode] = useState<'balanced'|'strict'|'coaching'>('balanced');
  const [focus, setFocus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ bandOverall:number; criteria:Criteria; feedback:string; model:string }|null>(null);
  const [error, setError] = useState<string|null>(null);

  const toggleFocus = (k: string) =>
    setFocus(prev => prev.includes(k) ? prev.filter(x=>x!==k) : [...prev, k]);

  const delta = (a:number, b:number) => Math.round((a - b) * 10)/10;

  const run = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/writing/reevaluate', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ attemptId, mode, focus })
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setResult({ bandOverall: data.bandOverall, criteria: data.criteria, feedback: data.feedback, model: data.model });
      onSaved?.({
        id: data.id,
        created_at: data.created_at,
        band_overall: data.bandOverall,
        band_breakdown: data.criteria,
        feedback: data.feedback,
        mode,
        focus,
      });
    } catch (e:any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-surface p-6 rounded-ds-2xl">
      <h3 className="text-h3">AI Re-evaluation</h3>
      <p className="text-grayish mt-1">Run a second pass with different strictness or focus.</p>

      <div className="mt-4">
        <label className="block">
          <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">Mode</span>
          <select
            className="w-full p-3.5 rounded-ds border border-gray-200 dark:border-white/10 bg-white dark:bg-dark"
            value={mode}
            onChange={(e)=>setMode(e.target.value as any)}
          >
            <option value="balanced">Balanced (default)</option>
            <option value="strict">Strict (tough marking)</option>
            <option value="coaching">Coaching (encouraging)</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {['task','coherence','lexical','grammar','tone'].map(k => (
          <button
            key={k}
            type="button"
            onClick={()=>toggleFocus(k)}
            className={`p-3.5 rounded-ds border border-gray-200 dark:border-white/10 ${focus.includes(k)?'bg-electricBlue/10 text-electricBlue border-electricBlue/30':''}`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Button onClick={run} disabled={loading} variant="primary" className="rounded-ds-xl">
          {loading ? 'Re-evaluating…' : 'Run Re-evaluation'}
        </Button>
      </div>

      {error && <Alert variant="error" title="Failed" className="mt-4">{error}</Alert>}

      {result && (
        <div className="mt-6 grid gap-4">
          <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <Badge variant="neutral" size="sm">Original: {original.bandOverall}</Badge>
              <Badge
                variant={result.bandOverall>original.bandOverall?'success':result.bandOverall<original.bandOverall?'danger':'neutral'}
                size="sm"
              >
                New: {result.bandOverall} ({delta(result.bandOverall, original.bandOverall)>0?'+':''}{delta(result.bandOverall, original.bandOverall)})
              </Badge>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {(['task','coherence','lexical','grammar'] as const).map(k => (
              <div key={k} className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="capitalize">{k}</span>
                  <Badge
                    variant={result.criteria[k]>original.criteria[k]?'success':result.criteria[k]<original.criteria[k]?'danger':'neutral'}
                    size="sm"
                  >
                    {original.criteria[k]} → {result.criteria[k]} ({delta(result.criteria[k], original.criteria[k])>0?'+':''}{delta(result.criteria[k], original.criteria[k])})
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <Alert variant="info" title="Feedback">{result.feedback}</Alert>
        </div>
      )}
    </Card>
  );
};
