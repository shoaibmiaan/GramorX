// pages/api/institutions/reports.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const QuerySchema = z.object({
  orgId: z.string().uuid(),
  rangeStart: z.string().datetime().optional(), // ISO start
  rangeEnd: z.string().datetime().optional(),   // ISO end
});

type KPI = {
  students: number;
  activeThisWeek: number;
  avgBand: number | null;
  mocksThisWeek: number;
};

type ModuleBreakdown = {
  module: 'listening' | 'reading' | 'writing' | 'speaking';
  attempts: number;
  avgScore: number | null;
};

type ReportsResponse =
  | { ok: true; orgId: string; kpi: KPI; modules: ModuleBreakdown[] }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'BAD_REQUEST' | 'DB_ERROR' | 'NOT_FOUND' };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReportsResponse>
) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  const { orgId, rangeStart, rangeEnd } = parsed.data;

  // Authorization
  const { data: me } = await supabase
    .from('institution_members')
    .select('org_id, role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!me || !['owner', 'admin', 'manager'].includes((me as any).role)) {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  // Use materialized/reporting views for fast aggregation where possible
  // 1) KPI summary
  const { data: kpiRow, error: kErr } = await supabase
    .from('institution_reports_kpi')
    .select('students, active_week, avg_band, mocks_week')
    .eq('org_id', orgId)
    .maybeSingle();

  if (kErr) return res.status(500).json({ ok: false, error: kErr.message, code: 'DB_ERROR' });

  const kpi: KPI = {
    students: kpiRow?.students ?? 0,
    activeThisWeek: kpiRow?.active_week ?? 0,
    avgBand: kpiRow?.avg_band ?? null,
    mocksThisWeek: kpiRow?.mocks_week ?? 0,
  };

  // 2) Module breakdown; optionally filter by range
  let mbQuery = supabase
    .from('institution_reports_modules')
    .select('module, attempts, avg_score')
    .eq('org_id', orgId);

  if (rangeStart) mbQuery = mbQuery.gte('bucket_start_utc', rangeStart);
  if (rangeEnd) mbQuery = mbQuery.lte('bucket_end_utc', rangeEnd);

  const { data: mods, error: mErr } = await mbQuery;
  if (mErr) return res.status(500).json({ ok: false, error: mErr.message, code: 'DB_ERROR' });

  const modules: ModuleBreakdown[] = (mods ?? []).map((m) => ({
    module: m.module,
    attempts: m.attempts,
    avgScore: m.avg_score,
  }));

  return res.status(200).json({ ok: true, orgId, kpi, modules });
}
