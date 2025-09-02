// components/review/AnswerDiff.tsx
import * as React from 'react';

export type AnswerDiffProps = {
  original: string | string[];
  revised: string | string[];
  mode?: 'word' | 'char';      // tokenization
  className?: string;
  titles?: { original?: string; revised?: string };
};

type Chunk =
  | { t: 'equal'; a: string[] }
  | { t: 'ins'; a: string[] }
  | { t: 'del'; a: string[] };

/** Tokenize input as words or characters (keeps punctuation for readability). */
function tokenize(input: string | string[], mode: 'word' | 'char'): string[] {
  if (Array.isArray(input)) return input.map(String);
  if (mode === 'char') return Array.from(input);
  // word mode: split on whitespace, keep punctuation attached
  return input.trim().length ? input.trim().split(/\s+/g) : [];
}

/** Simple LCS diff producing equal/ins/del chunks */
function diffChunks(a: string[], b: string[]): Chunk[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const chunks: Chunk[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      // equal
      const seg: string[] = [];
      while (i < m && j < n && a[i] === b[j]) {
        seg.push(a[i]); i++; j++;
      }
      chunks.push({ t: 'equal', a: seg });
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      // deletion from a
      const seg: string[] = [a[i++]];
      while (i < m && dp[i + 1]?.[j] >= dp[i]?.[j + 1] && a[i] !== b[j]) {
        seg.push(a[i++]);
      }
      chunks.push({ t: 'del', a: seg });
    } else {
      // insertion into b
      const seg: string[] = [b[j++]];
      while (j < n && dp[i + 1]?.[j] < dp[i]?.[j + 1]) {
        seg.push(b[j++]);
      }
      chunks.push({ t: 'ins', a: seg });
    }
  }
  if (i < m) chunks.push({ t: 'del', a: a.slice(i) });
  if (j < n) chunks.push({ t: 'ins', a: b.slice(j) });
  return chunks;
}

function renderChunk(mode: 'word' | 'char', c: Chunk, key: number) {
  const joiner = mode === 'char' ? '' : ' ';
  const text = c.a.join(joiner);
  if (c.t === 'equal') return <span key={key}>{text + (mode === 'char' ? '' : ' ')}</span>;
  if (c.t === 'ins')
    return (
      <ins
        key={key}
        className="rounded-sm bg-success/15 text-foreground no-underline px-0.5"
      >
        {text + (mode === 'char' ? '' : ' ')}
      </ins>
    );
  return (
    <del
      key={key}
      className="rounded-sm bg-error/15 text-foreground/80 line-through px-0.5"
    >
      {text + (mode === 'char' ? '' : ' ')}
    </del>
  );
}

export function AnswerDiff({
  original,
  revised,
  mode = 'word',
  className,
  titles,
}: AnswerDiffProps) {
  const a = tokenize(original, mode);
  const b = tokenize(revised, mode);
  const chunks = React.useMemo(() => diffChunks(a, b), [a.join('|'), b.join('|')]); // stable key

  return (
    <div className={['space-y-3', className || ''].join(' ')}>
      <div className="flex items-center gap-3 text-xs text-foreground/70">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-success" /> Insertions
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-error" /> Deletions
        </span>
      </div>

      {titles?.original || titles?.revised ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-foreground/70">
          {titles?.original && <div>Original: {titles.original}</div>}
          {titles?.revised && <div>Revised: {titles.revised}</div>}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed shadow-card">
        {chunks.map((c, idx) => renderChunk(mode, c, idx))}
      </div>
    </div>
  );
}

export default AnswerDiff;
