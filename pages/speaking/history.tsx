import React, { useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type AttemptRow = {
  id: string;
  created_at: string;
  source?: string | null;        // 'simulator' | 'partner' | 'roleplay' (optional)
  transcript?: string | null;
  chat_log?: any | null;
  audio_urls?: Record<string, string[]> | null; // { p1:[], p2:[], p3:[], chat:[], roleplay:[] }
  overall_band?: number | null;  // optional if you store
  p1_band?: number | null;
  p2_band?: number | null;
  p3_band?: number | null;
  scenario?: string | null;      // optional
};

function inferType(r: AttemptRow): 'Simulator' | 'Partner' | 'Roleplay' | 'Unknown' {
  const au = r.audio_urls || {};
  if (r.chat_log || (au.chat && au.chat.length)) return 'Partner';
  if (au.p1 || au.p2 || au.p3) return 'Simulator';
  if (r.scenario || (au as any).roleplay) return 'Roleplay';
  return (r.source as any) === 'partner' ? 'Partner'
       : (r.source as any) === 'simulator' ? 'Simulator'
       : (r.source as any) === 'roleplay' ? 'Roleplay'
       : 'Unknown';
}

function clipsSummary(au?: AttemptRow['audio_urls']) {
  const a = au || {};
  const n = (k: string) => (Array.isArray((a as any)[k]) ? (a as any)[k].length : 0);
  const p1 = n('p1'), p2 = n('p2'), p3 = n('p3'), chat = n('chat');
  const total = p1 + p2 + p3 + chat;
  const parts = [];
  if (p1) parts.push(`P1:${p1}`);
  if (p2) parts.push(`P2:${p2}`);
  if (p3) parts.push(`P3:${p3}`);
  if (chat) parts.push(`Chat:${chat}`);
  return parts.length ? `${parts.join(' · ')} (${total})` : '—';
}

export default function SpeakingHistory() {
  const [rows, setRows] = useState<AttemptRow[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabaseBrowser
          .from('speaking_attempts')
          .select('id, created_at, source, transcript, chat_log, audio_urls, overall_band, p1_band, p2_band, p3_band, scenario')
          .order('created_at', { ascending: false })
          .limit(30);
        if (error) throw new Error(error.message);
        setRows((data || []) as AttemptRow[]);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load history');
      }
    })();
  }, []);

  const table = useMemo(() => rows.map(r => {
    const kind = inferType(r);
    const created = new Date(r.created_at).toLocaleString();
    const clips = clipsSummary(r.audio_urls);
    const overall = r.overall_band ?? null;
    let reviewHref = '';
    if (kind === 'Simulator') reviewHref = `/speaking/review/${r.id}`;
    else reviewHref = `/speaking/partner/review/${r.id}`; // Partner & Roleplay use transcript-based review
    const idShort = r.id.slice(0, 8) + '…';
    return { id: r.id, idShort, created, kind, clips, overall, reviewHref };
  }), [rows]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-h1 md:text-display">Speaking History</h1>
        {err && <Badge variant="danger" size="sm" className="mt-3">{err}</Badge>}

        <Card className="card-surface p-0 mt-6 rounded-ds-2xl overflow-hidden">
          <div className="grid grid-cols-[160px_120px_1fr_120px_140px_140px] gap-0 text-sm font-medium bg-black/5 dark:bg-white/5 px-4 py-3">
            <div>Date</div>
            <div>Type</div>
            <div>Clips</div>
            <div>Overall</div>
            <div>Attempt</div>
            <div>Actions</div>
          </div>

          {table.map(row => (
            <div key={row.id} className="grid grid-cols-[160px_120px_1fr_120px_140px_140px] items-center gap-0 px-4 py-3 border-t border-black/10 dark:border-white/10">
              <div className="opacity-80">{row.created}</div>
              <div>{row.kind}</div>
              <div className="opacity-80">{row.clips}</div>
              <div>{row.overall ?? '—'}</div>
              <div className="font-mono text-xs opacity-70">{row.idShort}</div>
              <div className="flex gap-2">
                <Button as="a" href={row.reviewHref} variant="secondary" className="rounded-ds">Open review</Button>
              </div>
            </div>
          ))}

          {!table.length && (
            <div className="px-4 py-8 opacity-70">No attempts yet.</div>
          )}
        </Card>

        <div className="mt-4 flex gap-2">
          <Button as="a" href="/speaking" variant="secondary" className="rounded-ds">Back to Speaking</Button>
        </div>
      </Container>
    </section>
  );
}
