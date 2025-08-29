import React, { useEffect, useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { Alert } from '@/components/design-system/Alert';
import { ScoreCard } from '@/components/design-system/ScoreCard';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

/**
 * Highlight grammar and vocabulary issues by parsing custom markers
 * produced by the AI. Grammar problems are wrapped in `[g]...[/g]` and
 * vocabulary issues in `[v]...[/v]`. The returned React nodes preserve
 * original spacing and new lines.
 */
function renderAnnotated(text: string): React.ReactNode {
  const pieces: React.ReactNode[] = [];
  const regex = /\[(g|v)\](.*?)\[\/\1\]/gs;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pieces.push(text.slice(lastIndex, match.index));
    }
    const type = match[1];
    const content = match[2];
    const cls =
      type === 'g'
        ? 'bg-sunsetRed/20 text-sunsetRed dark:text-sunsetRed'
        : 'bg-goldenYellow/20 text-sunsetOrange dark:text-sunsetOrange';
    pieces.push(
      <span key={key++} className={`rounded px-0.5 ${cls}`}>
        {content}
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    pieces.push(text.slice(lastIndex));
  }
  return <>{pieces}</>;
}

// Read server-sent events from /api/ai/chat and accumulate the delta text.
async function annotateText(original: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/chat?p=openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content:
              'Surround grammar mistakes with [g][/g] and vocabulary issues with [v][/v]. Return only the annotated text.'
          },
          { role: 'user', content: original }
        ]
      })
    });
    if (!res.body) return original;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n\n')) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta) result += delta;
          } catch {
            // ignore malformed lines
          }
        }
      }
    }
    return result || original;
  } catch {
    return original;
  }
}

export interface WritingAIReviewProps {
  /** ID of the writing attempt already saved in Supabase */
  attemptId: string;
}

type AttemptRow = {
  essay_text: string;
  band_overall: number;
  band_breakdown: { task: number; coherence: number; lexical: number; grammar: number };
  feedback: string | null;
};

/**
 * Displays an AI generated review for a writing attempt. The component
 * fetches the attempt details from Supabase, asks the AI to annotate the
 * essay with grammar and vocabulary highlights, then renders the band
 * score, annotated essay and a suggestions panel.
 */
export const AIReview: React.FC<WritingAIReviewProps> = ({ attemptId }) => {
  const [attempt, setAttempt] = useState<AttemptRow | null>(null);
  const [annotated, setAnnotated] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabaseBrowser
          .from('writing_attempts')
          .select('essay_text, band_overall, band_breakdown, feedback')
          .eq('id', attemptId)
          .single();
        if (error) throw error;
        if (!mounted) return;
        setAttempt(data as AttemptRow);
        const a = await annotateText(data.essay_text);
        if (!mounted) return;
        setAnnotated(a);
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed to load review');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [attemptId]);

  if (loading) {
    return (
      <Card className="card-surface p-6 rounded-ds-2xl">Loading…</Card>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="AI review failed">{error}</Alert>
    );
  }

  if (!attempt) return null;

  return (
    <Card className="card-surface p-6 rounded-ds-2xl">
      <ScoreCard
        title="Writing Band"
        overall={attempt.band_overall}
        subscores={{
          taskResponse: attempt.band_breakdown.task,
          coherence: attempt.band_breakdown.coherence,
          vocabulary: attempt.band_breakdown.lexical,
          grammar: attempt.band_breakdown.grammar,
        }}
      />

      <h3 className="text-h3 mt-6">Your Essay</h3>
      <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10 whitespace-pre-wrap">
        {renderAnnotated(annotated || attempt.essay_text)}
      </div>

      {attempt.feedback && (
        <Alert variant="info" title="Suggestions" className="mt-6">
          {attempt.feedback}
        </Alert>
      )}
    </Card>
  );
};

export default AIReview;

