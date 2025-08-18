// pages/speaking/attempts.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { GradientText } from '@/components/design-system/GradientText';

type Feedback = {
  band?: number;
  summary?: string;
  aspects?: Array<{ key: 'fluency'|'lexical'|'grammar'|'pronunciation'; band: number; note?: string }>;
};

type PartKey = 'p1'|'p2'|'p3'|'chat';

type AnswerRow = {
  ctx: PartKey;
  file: string;         // full storage path for audio or json
  signedUrl?: string;   // audio playback link
  feedback?: Feedback;  // parsed feedback json (if this row is feedback)
  qLabel?: string;      // "Q1", "Q2", or "Cue Card", etc
};

type Attempt = {
  attemptId: string;
  createdAt: string;     // best-effort from first file timestamp
  items: AnswerRow[];
};

const BUCKET = 'speaking';

export default function SpeakingAttemptsPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({}); // attemptId -> expanded audio list

  // auth
  useEffect(() => {
    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      const uid = data.session?.user?.id || null;
      setUserId(uid);
    })();
  }, []);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      try {
        // 1) list attempt folders: speaking/<userId>/
        const rootPrefix = `speaking/${userId}`;
        const root = await supabaseBrowser.storage.from(BUCKET).list(rootPrefix, { limit: 1000 });
        if (root.error) throw root.error;

        // Filter directories (attempt ids)
        const attemptDirs = (root.data || []).filter((e: any) => e.id === null && e.name); // folders

        const attemptsOut: Attempt[] = [];

        for (const dir of attemptDirs) {
          const attemptId = dir.name;
          const attemptPrefix = `${rootPrefix}/${attemptId}`;

          // 2) list ctx folders inside attempt: p1/p2/p3/chat
          const ctxList = await supabaseBrowser.storage.from(BUCKET).list(attemptPrefix, { limit: 100 });
          if (ctxList.error) continue;

          const rows: AnswerRow[] = [];
          let firstTimestamp = Infinity;

          for (const ctxFolder of (ctxList.data || []).filter((e: any) => e.id === null)) {
            const ctx = ctxFolder.name as PartKey;
            const ctxPrefix = `${attemptPrefix}/${ctx}`;

            // 3) list files inside each ctx
            const files = await supabaseBrowser.storage.from(BUCKET).list(ctxPrefix, { limit: 1000 });
            if (files.error) continue;

            for (const f of files.data || []) {
              // capture earliest file modified for createdAt heuristic
              const updated = f.updated_at ? new Date(f.updated_at).getTime() : Date.now();
              if (updated < firstTimestamp) firstTimestamp = updated;

              const fullPath = `${ctxPrefix}/${f.name}`;
              if (f.name.endsWith('.webm')) {
                // audio: sign URL for playback
                const signed = await supabaseBrowser.storage.from(BUCKET).createSignedUrl(fullPath, 60 * 60 * 24);
                rows.push({
                  ctx,
                  file: fullPath,
                  signedUrl: signed.data?.signedUrl,
                  qLabel: deriveQLabel(ctx, f.name),
                });
              } else if (f.name.endsWith('feedback.json')) {
                // feedback JSON: download + parse
                const dl = await supabaseBrowser.storage.from(BUCKET).download(fullPath);
                if (dl.data) {
                  try {
                    const text = await dl.data.text();
                    const json = JSON.parse(text) as Feedback;
                    rows.push({
                      ctx,
                      file: fullPath,
                      feedback: json,
                      qLabel: deriveQLabel(ctx, f.name),
                    });
                  } catch {/* ignore parse errors */}
                }
              }
            }
          }

          // sort rows by ctx then q label
          rows.sort((a, b) => (a.ctx > b.ctx ? 1 : a.ctx < b.ctx ? -1 : (a.qLabel || '').localeCompare(b.qLabel || '')));

          attemptsOut.push({
            attemptId,
            createdAt: isFinite(firstTimestamp) ? new Date(firstTimestamp).toISOString() : '',
            items: rows,
          });
        }

        // most recent first
        attemptsOut.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
        setAttempts(attemptsOut);
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load attempts');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const summary = useMemo(() => {
    // compute per-attempt per-part average bands
    const out: Record<string, { overall?: number; byPart: Partial<Record<PartKey, number>>; countByPart: Partial<Record<PartKey, number>> }> = {};
    for (const a of attempts) {
      const bands: number[] = [];
      const byPart: Record<PartKey, number[]> = { p1: [], p2: [], p3: [], chat: [] };
      for (const it of a.items) {
        if (it.feedback?.band != null && !Number.isNaN(it.feedback.band)) {
          bands.push(it.feedback.band);
          byPart[it.ctx].push(it.feedback.band);
        }
      }
      const overall = avg(bands);
      const perPart: Partial<Record<PartKey, number>> = {};
      const countByPart: Partial<Record<PartKey, number>> = {};
      (Object.keys(byPart) as PartKey[]).forEach(k => {
        if (byPart[k].length) {
          perPart[k] = avg(byPart[k]);
          countByPart[k] = byPart[k].length;
        }
      });
      out[a.attemptId] = { overall, byPart: perPart, countByPart };
    }
    return out;
  }, [attempts]);

  if (!userId) {
    return (
      <>
        <Head><title>Speaking Attempts | GramorX</title></Head>
        <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
          <Container>
            <Card className="p-6 rounded-ds-2xl">
              <h1 className="font-slab text-display"><GradientText>Speaking Attempts</GradientText></h1>
              <Alert variant="warning" title="Sign in required">
                Please sign in to view your speaking history.
                <div className="mt-3">
                  <Button as="a" href="/auth/login" variant="primary">Go to Login</Button>
                </div>
              </Alert>
            </Card>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <Head><title>Speaking Attempts | GramorX</title></Head>
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 className="font-slab text-h1">Speaking Attempts</h1>
            <div className="flex gap-3">
              <Button as="a" href="/speaking/simulator" variant="primary">Open Simulator</Button>
              <Button as="a" href="/speaking" variant="secondary">Speaking Home</Button>
            </div>
          </div>

          {loading && (
            <Card className="p-6">
              <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" />
            </Card>
          )}

          {error && (
            <Alert variant="error" title="Couldn’t load attempts">{error}</Alert>
          )}

          {!loading && !error && attempts.length === 0 && (
            <Alert title="No attempts yet">
              Start the simulator to see your recordings and feedback here.
            </Alert>
          )}

          <div className="grid gap-6">
            {attempts.map(a => {
              const s = summary[a.attemptId];
              return (
                <Card key={a.attemptId} className="p-6 rounded-ds-2xl">
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                      <div className="text-sm opacity-80">Attempt</div>
                      <div className="font-mono text-lg">{a.attemptId}</div>
                      {a.createdAt && <div className="text-small opacity-70">Started: {fmt(a.createdAt)}</div>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s?.overall != null && (
                        <Badge variant={s.overall >= 7 ? 'success' : s.overall >= 6 ? 'warning' : 'danger'}>
                          Overall Band {s.overall.toFixed(1)}
                        </Badge>
                      )}
                      {(['p1','p2','p3'] as PartKey[]).map(k => {
                        const band = s?.byPart?.[k];
                        const count = s?.countByPart?.[k];
                        if (band == null && !count) return null;
                        const label = k === 'p1' ? 'Part 1' : k === 'p2' ? 'Part 2' : 'Part 3';
                        return (
                          <Badge key={k} variant={band && band >= 7 ? 'success' : band && band >= 6 ? 'warning' : 'neutral'}>
                            {label}{band != null ? ` • ${band.toFixed(1)}` : ''}{count ? ` • ${count} ans` : ''}
                          </Badge>
                        );
                      })}
                    </div>
                    <div className="ml-auto">
                      <Button
                        variant="secondary"
                        onClick={() => setExpanded(e => ({ ...e, [a.attemptId]: !e[a.attemptId] }))}
                      >
                        {expanded[a.attemptId] ? 'Hide details' : 'Show answers'}
                      </Button>
                    </div>
                  </div>

                  {expanded[a.attemptId] && (
                    <div className="mt-5 grid gap-4">
                      {renderGrouped(a.items)}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}

/* ---------- helpers ---------- */

function avg(nums: number[]) {
  if (!nums?.length) return undefined;
  const s = nums.reduce((a, b) => a + b, 0);
  return s / nums.length;
}

function fmt(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch { return iso; }
}

// Convert file name → friendly label
function deriveQLabel(ctx: PartKey, filename: string): string | undefined {
  if (ctx === 'p2') {
    if (filename.includes('feedback.json')) return 'Cue Card';
    return 'Cue Card Answer';
  }
  if (ctx === 'p1' || ctx === 'p3') {
    // feedback files are "<qid>.feedback.json" or "q{n}.feedback.json"
    const m = filename.match(/(q\d+)|(\w+)\.feedback\.json/);
    if (m?.[0]) return m[0].toUpperCase().replace('.FEEDBACK.JSON', '');
    // audio files are timestamps; we’ll map order visually
  }
  return undefined;
}

// Group rows by ctx, interleave audio + feedback per Q
function renderGrouped(items: AnswerRow[]) {
  const byCtx: Record<PartKey, AnswerRow[]> = { p1: [], p2: [], p3: [], chat: [] };
  items.forEach(it => byCtx[it.ctx].push(it));

  const blocks: JSX.Element[] = [];
  (['p1','p2','p3'] as PartKey[]).forEach(k => {
    if (!byCtx[k].length) return;
    const title = k === 'p1' ? 'Part 1 — Interview' : k === 'p2' ? 'Part 2 — Cue Card' : 'Part 3 — Discussion';
    blocks.push(
      <Card key={k} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge>{title}</Badge>
        </div>
        <div className="grid gap-3">
          {mergeAudioFeedback(byCtx[k]).map((row, i) => (
            <Card key={i} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-medium">{row.qLabel || `Answer ${i + 1}`}</div>
                {row.audioUrl && <audio src={row.audioUrl} controls className="w-64" />}
              </div>
              {row.feedback && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="info">AI Feedback</Badge>
                    {typeof row.feedback.band === 'number' && (
                      <Badge variant={row.feedback.band >= 7 ? 'success' : row.feedback.band >= 6 ? 'warning' : 'danger'}>
                        Band {row.feedback.band.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  {row.feedback.summary && <p className="opacity-90">{row.feedback.summary}</p>}
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>
    );
  });

  return <div className="grid gap-4">{blocks}</div>;
}

function mergeAudioFeedback(rows: AnswerRow[]) {
  // Combine audio and feedback by inferred question label
  const map: Record<string, { qLabel?: string; audioUrl?: string; feedback?: Feedback }> = {};
  for (const r of rows) {
    const key = r.qLabel || r.file; // fallback to file path
    if (!map[key]) map[key] = { qLabel: r.qLabel };
    if (r.signedUrl) map[key].audioUrl = r.signedUrl;
    if (r.feedback) map[key].feedback = r.feedback;
  }
  return Object.values(map);
}
