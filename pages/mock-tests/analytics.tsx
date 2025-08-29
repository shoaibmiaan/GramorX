import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

interface ResultRow {
  created_at: string;
  section: string;
  band: number;
  time_taken: number;
  correct: number;
  total: number;
}

interface SectionStat {
  section: string;
  totalTime: number;
  avgBand: number;
  attempts: number;
}

export default function MockTestAnalytics() {
  const router = useRouter();
  const [results, setResults] = useState<ResultRow[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session?.user) {
        router.replace('/login');
        return;
      }
      const { data } = await supabaseBrowser
        .from('mock_test_results')
        .select('created_at,section,band,time_taken,correct,total')
        .eq('user_id', session.user.id)
        .order('created_at');
      if (!mounted) return;
      setResults((data as ResultRow[]) || []);
    })();
    return () => { mounted = false; };
  }, [router]);

  const trendData = groupByDate(results);
  const sectionStats = computeSectionStats(results);
  const weakSections = [...sectionStats].sort((a, b) => a.avgBand - b.avgBand).slice(0, 2);

  return (
    <section className="py-10">
      <Container>
        <Card className="p-6 rounded-ds-2xl">
          <h1 className="font-slab text-h2 mb-6">Mock Test Analytics</h1>
          <div className="mb-8">
            <h2 className="font-slab text-h3 mb-2">Band Trends</h2>
            <BandChart data={trendData} />
          </div>
          <div className="mb-8">
            <h2 className="font-slab text-h3 mb-2">Time Spent</h2>
            <TimeChart data={sectionStats} />
          </div>
          <div>
            <h2 className="font-slab text-h3 mb-2">Weak Sections</h2>
            <ul className="list-disc list-inside space-y-1">
              {weakSections.map((s) => (
                <li key={s.section}>
                  {s.section} (avg band {s.avgBand.toFixed(1)}) —{' '}
                  <Link className="text-primary underline" href={`/mock-tests/${s.section}`}>
                    Practice {s.section}
                  </Link>
                </li>
              ))}
              {weakSections.length === 0 && <li>No attempts yet.</li>}
            </ul>
          </div>
        </Card>
      </Container>
    </section>
  );
}

function groupByDate(rows: ResultRow[]) {
  const map = new Map<string, any>();
  rows.forEach((r) => {
    const date = r.created_at.slice(0, 10);
    const entry = map.get(date) || { date };
    entry[r.section] = r.band;
    map.set(date, entry);
  });
  return Array.from(map.values());
}

function computeSectionStats(rows: ResultRow[]): SectionStat[] {
  const stats: Record<string, { totalTime: number; totalBand: number; attempts: number }> = {};
  rows.forEach((r) => {
    const s = stats[r.section] || { totalTime: 0, totalBand: 0, attempts: 0 };
    s.totalTime += r.time_taken;
    s.totalBand += r.band;
    s.attempts += 1;
    stats[r.section] = s;
  });
  return Object.entries(stats).map(([section, s]) => ({
    section,
    totalTime: s.totalTime,
    avgBand: s.totalBand / s.attempts,
    attempts: s.attempts,
  }));
}

function BandChart({ data }: { data: any[] }) {
  const sections = ['listening', 'reading', 'writing', 'speaking'];
  const colors: Record<string, string> = {
    listening: '#10b981',
    reading: '#3b82f6',
    writing: '#f97316',
    speaking: '#8b5cf6',
  };
  const width = 600;
  const height = 200;
  return (
    <svg
      width="100%"
      height="200"
      viewBox={`0 0 ${width} ${height}`}
      className="bg-lightBg dark:bg-dark rounded-ds border border-gray-200 dark:border-gray-700"
    >
      {sections.map((s) => {
        const points = data
          .map((d, i) => {
            const x = (i / Math.max(1, data.length - 1)) * width;
            const band = Number(d[s] ?? 0);
            const y = height - (band / 9) * height;
            return `${x},${y}`;
          })
          .join(' ');
        return <polyline key={s} fill="none" stroke={colors[s]} strokeWidth={2} points={points} />;
      })}
      <line x1={0} y1={height} x2={width} y2={height} stroke="#ccc" strokeWidth={1} />
      <line x1={0} y1={0} x2={0} y2={height} stroke="#ccc" strokeWidth={1} />
    </svg>
  );
}

function TimeChart({ data }: { data: SectionStat[] }) {
  const width = 600;
  const rowHeight = 30;
  const height = data.length * rowHeight;
  const max = Math.max(...data.map((d) => d.totalTime), 1);
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="bg-lightBg dark:bg-dark rounded-ds border border-gray-200 dark:border-gray-700"
    >
      {data.map((d, i) => {
        const barWidth = (d.totalTime / max) * width;
        const y = i * rowHeight;
        return (
          <g key={d.section}>
            <rect x={0} y={y + 5} width={barWidth} height={20} fill="#10b981" />
            <text x={barWidth + 5} y={y + 20} fontSize={12} fill="currentColor">
              {`${d.section} (${Math.round(d.totalTime)}s)`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

