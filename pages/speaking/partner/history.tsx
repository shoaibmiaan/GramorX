// pages/speaking/partner/history.tsx
import React, { useMemo, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/design-system/Input';

type Attempt = {
  id: string;
  created_at: string;
  p1_band?: number | null;
  p2_band?: number | null;
  p3_band?: number | null;
  overall_band?: number | null;
  chat_log?: any | null;
};

type Clip = {
  id: string;
  attempt_id: string;
  part: 'p1' | 'p2' | 'p3' | 'chat';
  created_at: string;
};

type Props = {
  attempts: Attempt[];
  clips: Clip[];
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Recent attempts for the (RLS-scoped) current user
  const { data: attempts = [] } = await supabase
    .from('speaking_attempts')
    .select('id, created_at, p1_band, p2_band, p3_band, overall_band, chat_log')
    .order('created_at', { ascending: false })
    .limit(40);

  // Fetch clips for those attempts (to detect partner vs simulator + counts)
  const ids = attempts.map((a) => a.id);
  let clips: Clip[] = [];
  if (ids.length) {
    const { data = [] } = await supabase
      .from('speaking_clips')
      .select('id, attempt_id, part, created_at')
      .in('attempt_id', ids)
      .order('created_at', { ascending: true });
    clips = data as Clip[];
  }

  return { props: { attempts, clips } };
};

export default function PartnerHistoryPage({ attempts, clips }: Props) {
  const [q, setQ] = useState('');

  const clipMap = useMemo(() => {
    const m = new Map<string, Clip[]>();
    for (const c of clips) {
      if (!m.has(c.attempt_id)) m.set(c.attempt_id, []);
      m.get(c.attempt_id)!.push(c);
    }
    return m;
  }, [clips]);

  const rows = useMemo(() => {
    return attempts
      .map((a) => {
        const list = clipMap.get(a.id) || [];
        const chatCount = list.filter((c) => c.part === 'chat').length;
        const p1 = list.filter((c) => c.part === 'p1').length;
        const p2 = list.filter((c) => c.part === 'p2').length;
        const p3 = list.filter((c) => c.part === 'p3').length;

        const isPartner = chatCount > 0 || (Array.isArray(a.chat_log) && a.chat_log.length > 0);
        const kind: 'partner' | 'simulator' = isPartner ? 'partner' : 'simulator';

        const reviewHref = kind === 'partner'
          ? `/speaking/partner/review/${a.id}`
          : `/speaking/review/${a.id}`;

        return {
          id: a.id,
          created: a.created_at,
          p1_band: a.p1_band ?? null,
          p2_band: a.p2_band ?? null,
          p3_band: a.p3_band ?? null,
          overall_band: a.overall_band ?? null,
          chatCount,
          p1Count: p1,
          p2Count: p2,
          p3Count: p3,
          kind,
          reviewHref,
        };
      })
      .filter((r) => {
        const term = q.trim().toLowerCase();
        if (!term) return true;
        return (
          r.id.toLowerCase().includes(term) ||
          r.kind.includes(term) ||
          new Date(r.created).toLocaleString().toLowerCase().includes(term)
        );
      });
  }, [attempts, clipMap, q]);

  return (
    <div className="py-24">
      <Container>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-h1 font-semibold">Speaking Attempts History</h1>
            <p className="text-gray-600 dark:text-grayish">
              Review your AI Partner and Simulator attempts.
            </p>
          </div>
          <Link href="/speaking/partner">
            <Button variant="ghost">Back to Partner</Button>
          </Link>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by attempt ID, type, or date…"
              value={q}
              onChange={(e: any) => setQ(e.target.value)}
              className="flex-1"
            />
            <Badge intent="neutral">{rows.length} shown</Badge>
          </div>
        </Card>

        {rows.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-h3 font-semibold mb-1">No attempts found</div>
            <p className="text-gray-600 dark:text-grayish mb-4">
              Start a conversation on the Partner screen or record in the Simulator.
            </p>
            <div className="flex justify-center gap-2">
              <Link href="/speaking/partner"><Button>Open Partner</Button></Link>
              <Link href="/speaking/simulator"><Button variant="ghost">Open Simulator</Button></Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rows.map((r) => (
              <Card key={r.id} className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge intent={r.kind === 'partner' ? 'primary' : 'neutral'}>
                      {r.kind === 'partner' ? 'Partner' : 'Simulator'}
                    </Badge>
                    <div className="text-sm text-gray-600 dark:text-grayish">
                      {new Date(r.created).toLocaleString()}
                    </div>
                  </div>
                  <Badge intent={r.overall_band ? 'success' : 'neutral'}>
                    Overall: {r.overall_band ?? '—'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat label="Turns (chat)" value={r.chatCount} />
                  <Stat label="Part 1" value={r.p1Count} />
                  <Stat label="Part 2" value={r.p2Count} />
                  <Stat label="Part 3" value={r.p3Count} />
                </div>

                <div className="text-sm opacity-80">
                  Bands: P1 {fmtBand(r.p1_band)} · P2 {fmtBand(r.p2_band)} · P3 {fmtBand(r.p3_band)}
                </div>

                <div className="flex items-center gap-2">
                  <Link href={r.reviewHref}>
                    <Button>Review</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => navigator.clipboard?.writeText(r.id)}
                  >
                    Copy ID
                  </Button>
                </div>

                <div className="text-xs text-gray-600 dark:text-grayish font-mono break-all">
                  {r.id}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-ds-2xl card-surface p-3 text-center">
      <div className="text-h4 font-semibold">{value}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  );
}

function fmtBand(b: number | null) {
  return b == null ? '—' : b;
}
