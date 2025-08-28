import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

interface BandRow {
  attempt_date: string;
  skill: string;
  band: number;
}

interface AccuracyRow {
  question_type: string;
  accuracy_pct: number;
}

interface TimeRow {
  skill: string;
  total_minutes: number;
}

export default function Progress() {
  const router = useRouter();
  const [bandData, setBandData] = useState<Array<Record<string, any>>>([]);
  const [accuracyData, setAccuracyData] = useState<AccuracyRow[]>([]);
  const [timeData, setTimeData] = useState<TimeRow[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session?.user) {
        router.replace('/login');
        return;
      }
      const uid = session.user.id;
      const { data: bt } = await supabaseBrowser
        .from('progress_band_trajectory')
        .select('attempt_date,skill,band')
        .eq('user_id', uid)
        .order('attempt_date');
      const { data: acc } = await supabaseBrowser
        .from('progress_accuracy_per_type')
        .select('question_type,accuracy_pct')
        .eq('user_id', uid);
      const { data: tt } = await supabaseBrowser
        .from('progress_time_spent')
        .select('skill,total_minutes')
        .eq('user_id', uid);
      if (!mounted) return;
      setBandData(groupBand(bt ?? []));
      setAccuracyData(acc ?? []);
      setTimeData(tt ?? []);
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
    bandData.forEach((row: any) => {
      lines.push(`${row.date || ''},${row.reading ?? ''},${row.listening ?? ''},${row.writing ?? ''},${row.speaking ?? ''}`);
    });
    lines.push('');
    lines.push('accuracy_per_question_type');
    lines.push('question_type,accuracy_pct');
    accuracyData.forEach(r => lines.push(`${r.question_type},${r.accuracy_pct}`));
    lines.push('');
    lines.push('time_spent');
    lines.push('skill,total_minutes');
    timeData.forEach(r => lines.push(`${r.skill},${r.total_minutes}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'progress.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-10">
      <Container>
        <Card className="p-6 rounded-ds-2xl">
          <h1 className="font-slab text-h2 mb-6">Progress</h1>
          <div className="flex gap-2 mb-6">
            <Button variant="secondary" onClick={exportCSV}>Export CSV</Button>
            <Button variant="secondary" onClick={exportJSON}>Export JSON</Button>
          </div>
          <div className="mb-8">
            <h2 className="font-slab text-h3 mb-2">Band trajectory</h2>
            <BandChart data={bandData} />
          </div>
          <div className="mb-8">
            <h2 className="font-slab text-h3 mb-2">Accuracy per question type</h2>
            <AccuracyChart data={accuracyData} />
          </div>
          <div>
            <h2 className="font-slab text-h3 mb-2">Total time spent</h2>
            <TimeChart data={timeData} />
          </div>
        </Card>
      </Container>
    </section>
  );
}

function groupBand(rows: BandRow[]) {
  const map = new Map<string, any>();
  rows.forEach(r => {
    const date = r.attempt_date.slice(0, 10);
    const entry = map.get(date) || { date };
    entry[r.skill] = r.band;
    map.set(date, entry);
  });
  return Array.from(map.values());
}

function BandChart({ data }: { data: any[] }) {
  const skills = ['reading', 'listening', 'writing', 'speaking'];
  const colors: Record<string, string> = {
    reading: '#3b82f6',
    listening: '#10b981',
    writing: '#f97316',
    speaking: '#8b5cf6',
  };
  const width = 600;
  const height = 200;
  return (
    <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`}
      className="bg-lightBg dark:bg-dark rounded-ds border border-gray-200 dark:border-gray-700">
      {skills.map(skill => {
        const points = data.map((d, i) => {
          const x = (i / Math.max(1, data.length - 1)) * width;
          const band = Number(d[skill] ?? 0);
          const y = height - (band / 9) * height;
          return `${x},${y}`;
        }).join(' ');
        return <polyline key={skill} fill="none" stroke={colors[skill]} strokeWidth={2} points={points} />;
      })}
      {/* axes */}
      <line x1={0} y1={height} x2={width} y2={height} stroke="#ccc" strokeWidth={1} />
      <line x1={0} y1={0} x2={0} y2={height} stroke="#ccc" strokeWidth={1} />
    </svg>
  );
}

function AccuracyChart({ data }: { data: AccuracyRow[] }) {
  const width = 600;
  const height = 200;
  const barWidth = data.length ? width / data.length - 10 : 0;
  return (
    <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`}
      className="bg-lightBg dark:bg-dark rounded-ds border border-gray-200 dark:border-gray-700">
      {data.map((d, i) => {
        const h = (d.accuracy_pct / 100) * height;
        const x = i * (barWidth + 10) + 5;
        const y = height - h;
        return <rect key={d.question_type} x={x} y={y} width={barWidth} height={h} fill="#3b82f6" />;
      })}
      <line x1={0} y1={height} x2={width} y2={height} stroke="#ccc" strokeWidth={1} />
    </svg>
  );
}

function TimeChart({ data }: { data: TimeRow[] }) {
  const width = 600;
  const rowHeight = 30;
  const height = data.length * rowHeight;
  const max = Math.max(...data.map(d => d.total_minutes), 1);
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}
      className="bg-lightBg dark:bg-dark rounded-ds border border-gray-200 dark:border-gray-700">
      {data.map((d, i) => {
        const barWidth = (d.total_minutes / max) * width;
        const y = i * rowHeight;
        return (
          <g key={d.skill}>
            <rect x={0} y={y + 5} width={barWidth} height={20} fill="#10b981" />
            <text x={barWidth + 5} y={y + 20} fontSize={12} fill="currentColor">
              {`${d.skill} (${Math.round(d.total_minutes)}m)`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

