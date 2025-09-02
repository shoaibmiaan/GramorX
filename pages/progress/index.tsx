import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Skill = 'reading' | 'listening' | 'writing' | 'speaking';

interface BandRow {
  attempt_date: string; // ISO
  skill: Skill;
  band: number;
}

interface AccuracyRow {
  question_type: string;
  accuracy_pct: number;
}

interface TimeRow {
  skill: Skill;
  total_minutes: number;
}

type BandDay = { date: string } & Partial<Record<Skill, number>>;

export default function Progress() {
  const router = useRouter();
  const [bandData, setBandData] = useState<BandDay[]>([]);
  const [accuracyData, setAccuracyData] = useState<AccuracyRow[]>([]);
  const [timeData, setTimeData] = useState<TimeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session?.user) {
        router.replace('/login');
        return;
      }
      const uid = session.user.id;

      const [{ data: bt }, { data: acc }, { data: tt }] = await Promise.all([
        supabaseBrowser
          .from('progress_band_trajectory')
          .select('attempt_date,skill,band')
          .eq('user_id', uid)
          .order('attempt_date'),
        supabaseBrowser
          .from('progress_accuracy_per_type')
          .select('question_type,accuracy_pct')
          .eq('user_id', uid),
        supabaseBrowser
          .from('progress_time_spent')
          .select('skill,total_minutes')
          .eq('user_id', uid),
      ]);

      if (!mounted) return;
      setBandData(groupBand((bt ?? []) as BandRow[]));
      setAccuracyData((acc ?? []) as AccuracyRow[]);
      setTimeData((tt ?? []) as TimeRow[]);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [router]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ bandData, accuracyData, timeData }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const lines: string[] = [];
    lines.push('band_trajectory');
    lines.push('date,reading,listening,writing,speaking');
    bandData.forEach((row) => {
      lines.push(`${row.date || ''},${row.reading ?? ''},${row.listening ?? ''},${row.writing ?? ''},${row.speaking ?? ''}`);
    });
    lines.push('');
    lines.push('accuracy_per_question_type');
    lines.push('question_type,accuracy_pct');
    accuracyData.forEach((r) => lines.push(`${safeCsv(r.question_type)},${r.accuracy_pct}`));
    lines.push('');
    lines.push('time_spent');
    lines.push('skill,total_minutes');
    timeData.forEach((r) => lines.push(`${r.skill},${Math.round(r.total_minutes)}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'progress.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasAnyData = bandData.length || accuracyData.length || timeData.length;

  return (
    <section className="py-10">
      <Container>
        <Card className="p-6 rounded-ds-2xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-slab text-h2">Progress</h1>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={exportCSV}>Export CSV</Button>
              <Button variant="secondary" onClick={exportJSON}>Export JSON</Button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-border p-4 text-sm text-foreground/70">Loading your analytics…</div>
          ) : !hasAnyData ? (
            <EmptyState />
          ) : (
            <>
              <div className="mb-8">
                <h2 className="font-slab text-h3 mb-2">Band trajectory</h2>
                <BandChart data={bandData} />
                <p className="mt-2 text-xs text-foreground/70">
                  Tip: Complete a <Link href="/mock/listening/sample-001" className="underline underline-offset-4">Listening mock</Link> today to update this graph.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="font-slab text-h3 mb-2">Accuracy per question type</h2>
                <AccuracyChart data={accuracyData} />
              </div>

              <div>
                <h2 className="font-slab text-h3 mb-2">Total time spent</h2>
                <TimeChart data={timeData} />
              </div>
            </>
          )}
        </Card>
      </Container>
    </section>
  );
}

/* ---------- helpers ---------- */

function groupBand(rows: BandRow[]): BandDay[] {
  const map = new Map<string, BandDay>();
  rows.forEach((r) => {
    const date = r.attempt_date.slice(0, 10);
    const entry = map.get(date) || { date };
    entry[r.skill] = r.band;
    map.set(date, entry);
  });
  return Array.from(map.values());
}

function safeCsv(s: string) {
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/* ---------- charts (token-only colors) ---------- */
/** Notes:
 * - We avoid hex/inline colors. All strokes/fills use currentColor with token classes.
 * - Axes use `text-border` → stroke="currentColor".
 * - Series use token classes: reading=primary, listening=secondary, writing=accent, speaking=foreground.
 */

function BandChart({ data }: { data: BandDay[] }) {
  const skills: Skill[] = ['reading', 'listening', 'writing', 'speaking'];
  const seriesClass: Record<Skill, string> = {
    reading: 'text-primary',
    listening: 'text-secondary',
    writing: 'text-accent',
    speaking: 'text-foreground',
  };

  const width = 600;
  const height = 220;
  const n = Math.max(1, data.length - 1);
  const pointsFor = (skill: Skill) =>
    data.map((d, i) => {
      const x = (i / Math.max(1, n)) * width;
      const band = Number((d as any)[skill] ?? 0);
      const y = height - (Math.min(9, Math.max(0, band)) / 9) * height;
      return `${x},${y}`;
    }).join(' ');

  return (
    <svg
      role="img"
      aria-label="Band trajectory across skills"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="rounded-ds border border-border"
    >
      {/* axes */}
      <g className="text-border">
        <line x1={0} y1={height} x2={width} y2={height} stroke="currentColor" strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={height} stroke="currentColor" strokeWidth={1} />
      </g>

      {/* series */}
      {skills.map((s) => (
        <polyline
          key={s}
          className={seriesClass[s]}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          points={pointsFor(s)}
        />
      ))}

      {/* legend */}
      <g transform={`translate(8,8)`} className="text-foreground/80">
        {skills.map((s, i) => (
          <g key={s} transform={`translate(${i * 130},0)`}>
            <line x1={0} y1={6} x2={20} y2={6} className={seriesClass[s]} stroke="currentColor" strokeWidth={3} />
            <text x={26} y={10} fontSize={12} className="fill-current">{cap(s)}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function AccuracyChart({ data }: { data: AccuracyRow[] }) {
  const width = 600;
  const height = 220;
  const gap = 10;
  const barWidth = data.length ? width / data.length - gap : 0;

  return (
    <svg
      role="img"
      aria-label="Accuracy per question type"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="rounded-ds border border-border"
    >
      {/* axis */}
      <g className="text-border">
        <line x1={0} y1={height - 1} x2={width} y2={height - 1} stroke="currentColor" strokeWidth={1} />
      </g>

      {/* bars */}
      {data.map((d, i) => {
        const h = Math.max(0, Math.min(100, d.accuracy_pct)) / 100 * (height - 20);
        const x = i * (barWidth + gap) + gap / 2;
        const y = height - 1 - h;
        return (
          <g key={d.question_type}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              className="text-primary"
              fill="currentColor"
              rx={6}
            />
            <text
              x={x + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize={11}
              className="fill-current text-foreground/70"
            >
              {d.question_type}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TimeChart({ data }: { data: TimeRow[] }) {
  const width = 600;
  const rowH = 32;
  const height = Math.max(1, data.length) * rowH + 8;
  const max = Math.max(...data.map((d) => d.total_minutes), 1);

  const barClass: Record<Skill, string> = {
    reading: 'text-primary',
    listening: 'text-secondary',
    writing: 'text-accent',
    speaking: 'text-foreground',
  };

  return (
    <svg
      role="img"
      aria-label="Total time spent per skill"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="rounded-ds border border-border"
    >
      {data.map((d, i) => {
        const barW = (d.total_minutes / max) * (width - 120);
        const y = i * rowH + 8;
        return (
          <g key={d.skill}>
            <text x={0} y={y + 16} fontSize={12} className="fill-current text-foreground/70">{cap(d.skill)}</text>
            <rect x={100} y={y} width={barW} height={20} className={barClass[d.skill]} fill="currentColor" rx={8} />
            <text x={100 + barW + 8} y={y + 15} fontSize={12} className="fill-current text-foreground/80">
              {`${Math.round(d.total_minutes)} min`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- small utils ---------- */
const cap = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1);
