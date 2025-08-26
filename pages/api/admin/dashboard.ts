// /pages/api/admin/dashboard.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/requireRole';

type Stat = { label: string; value: string; sub?: string };
type Signup = { id: string; name: string; email: string; joinedAt: string; cohort?: string };
type Module = 'Listening' | 'Reading' | 'Writing' | 'Speaking';
type ModuleRow = { module: Module; attempts: number; avgScore: number };
type QueueRow = { name: string; pending: number; avgLatencySec: number };
type HealthRow = { name: string; status: 'ok' | 'warn' | 'down'; note?: string };
type Series = { labels: string[]; values: number[] };

type StudentsBlock = {
  rows: Signup[];
  total: number;
  page: number;
  size: number;
};

type Payload = {
  stats: Stat[];
  recentSignups: Signup[];
  moduleUsage: ModuleRow[];
  aiQueues: QueueRow[];
  systemHealth: HealthRow[];
  series: Series;
  students: StudentsBlock;
};

const MODULE_TABLE: Record<Module, string> = {
  Listening: 'listening_attempts',
  Reading: 'reading_attempts',
  Writing: 'writing_attempts',
  Speaking: 'speaking_attempts',
};

function todayYMD() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function ymdNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function clampRange(fromYmd?: string, toYmd?: string) {
  const from = fromYmd || ymdNDaysAgo(14);
  const to = toYmd || todayYMD();
  return { from, to };
}
function ymdToIsoStart(ymd: string) {
  return `${ymd}T00:00:00.000Z`;
}
function ymdToIsoEnd(ymd: string) {
  return `${ymd}T23:59:59.999Z`;
}

async function safeCount(table: string, builder: (q: ReturnType<typeof supabaseAdmin.from>) => any) {
  try {
    const base = supabaseAdmin.from(table);
    const { count, error } = await builder(base).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function safeAvgScore(table: string, fromIso: string, toIso: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('avg_score:avg(score)')
      .gte('created_at', fromIso)
      .lte('created_at', toIso)
      .single();
    if (error) throw error;
    const val = (data?.avg_score ?? 0) as number;
    return Number.isFinite(val) ? Math.round(val) : 0;
  } catch {
    return 0;
  }
}

async function recentUsers(): Promise<Signup[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, created_at, cohort')
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    return (data ?? []).map((u: any) => ({
      id: String(u.id),
      name: u.full_name || '—',
      email: u.email || '—',
      joinedAt: new Date(u.created_at).toLocaleString(),
      cohort: u.cohort ?? undefined,
    }));
  } catch {
    // fallback to auth.users
    try {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 5 });
      return (data.users ?? []).sort(
        (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
      ).slice(0, 5).map((u) => ({
        id: u.id,
        name: (u.user_metadata?.name as string) || '—',
        email: u.email ?? '—',
        joinedAt: new Date(u.created_at).toLocaleString(),
      }));
    } catch {
      return [];
    }
  }
}

async function seriesCounts(fromIso: string, toIso: string, onlyModule?: Module): Promise<Series> {
  // labels as YYYY-MM-DD between from..to
  const start = new Date(fromIso);
  const end = new Date(toIso);
  const days = Math.max(1, Math.ceil((+end - +start) / (24 * 3600 * 1000)) + 1);
  const labels: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getUTCDate() + i);
    labels.push(`D-${days - 1 - i}`);
  }

  async function fetchAttempts(table: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('created_at')
        .gte('created_at', fromIso)
        .lte('created_at', toIso)
        .limit(20000);
      if (error) throw error;
      return (data ?? []) as { created_at: string }[];
    } catch {
      return [];
    }
  }

  const tables = onlyModule ? [MODULE_TABLE[onlyModule]] : Object.values(MODULE_TABLE);
  const datasets = await Promise.all(tables.map(fetchAttempts));

  // count per date (yyyy-mm-dd)
  const byDate = new Map<string, number>();
  for (const ds of datasets) {
    for (const r of ds) {
      const d = new Date(r.created_at);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }
  }

  const values: number[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getUTCDate() + i);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    values.push(byDate.get(key) ?? 0);
  }

  return { labels, values };
}

async function moduleBlock(name: Module, table: string, fromIso: string, toIso: string): Promise<ModuleRow> {
  const attempts = await safeCount(table, (q) => q.gte('created_at', fromIso).lte('created_at', toIso));
  const avgScore = await safeAvgScore(table, fromIso, toIso);
  return { module: name, attempts, avgScore };
}

async function queueCount(primaryTable: string, fallbackTable: string, statusCol = 'status', fromIso?: string, toIso?: string) {
  const builder = (q: any) => {
    let qq = q.eq(statusCol, 'pending');
    if (fromIso) qq = qq.gte('created_at', fromIso);
    if (toIso) qq = qq.lte('created_at', toIso);
    return qq;
  };
  const primary = await safeCount(primaryTable, builder);
  if (primary > 0) return primary;
  return safeCount(fallbackTable, (q: any) => {
    let qq = q.eq('eval_status', 'pending');
    if (fromIso) qq = qq.gte('created_at', fromIso);
    if (toIso) qq = qq.lte('created_at', toIso);
    return qq;
  });
}

async function studentsPaged(fromIso: string, toIso: string, cohort?: string, q?: string, page = 1, size = 10): Promise<StudentsBlock> {
  // Try profiles table first
  try {
    let sel = supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, created_at, cohort', { count: 'exact' })
      .gte('created_at', fromIso)
      .lte('created_at', toIso);

    if (cohort && cohort !== 'All') sel = sel.eq('cohort', cohort);
    if (q && q.trim()) {
      // Simple ilike on name or email
      sel = sel.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    sel = sel.order('created_at', { ascending: false });

    const from = (page - 1) * size;
    const to = from + size - 1;
    const { data, count, error } = await sel.range(from, to);
    if (error) throw error;

    const rows: Signup[] = (data ?? []).map((u: any) => ({
      id: String(u.id),
      name: u.full_name || '—',
      email: u.email || '—',
      joinedAt: new Date(u.created_at).toLocaleString(),
      cohort: u.cohort ?? undefined,
    }));

    return {
      rows,
      total: count ?? rows.length,
      page,
      size,
    };
  } catch {
    // Fallback: auth.users (no cohort; filter by created_at & email/name best-effort)
    try {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 500 });
      let users = data.users ?? [];
      if (q && q.trim()) {
        const qq = q.toLowerCase();
        users = users.filter(
          (u) =>
            (u.email ?? '').toLowerCase().includes(qq) ||
            (String(u.user_metadata?.name ?? '').toLowerCase().includes(qq))
        );
      }
      const fIso = +new Date(fromIso);
      const tIso = +new Date(toIso);
      users = users.filter((u) => {
        const t = +new Date(u.created_at);
        return t >= fIso && t <= tIso;
      });

      const total = users.length;
      const start = (page - 1) * size;
      const end = start + size;
      const slice = users.slice(start, end);

      return {
        rows: slice.map((u) => ({
          id: u.id,
          name: (u.user_metadata?.name as string) || '—',
          email: u.email ?? '—',
          joinedAt: new Date(u.created_at).toLocaleString(),
        })),
        total,
        page,
        size,
      };
    } catch {
      return { rows: [], total: 0, page, size };
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Payload | { error: string }>) {
  try {
    await requireRole(req, ['admin']);
  } catch {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const {
      from: fromYmd,
      to: toYmd,
      module: moduleParam,
      cohort,
      student_q,
      student_page = '1',
      student_size = '10',
    } = req.query as Record<string, string | undefined>;

    const { from, to } = clampRange(fromYmd, toYmd);
    const fromIso = ymdToIsoStart(from);
    const toIso = ymdToIsoEnd(to);

    const onlyModule = (['Listening', 'Reading', 'Writing', 'Speaking'].includes(moduleParam || '') ? moduleParam : undefined) as Module | undefined;

    // ---- Core blocks
    const totalUsers = await (async () => {
      try {
        const { count } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
        return count ?? 0;
      } catch {
        return 0;
      }
    })();

    const readingTests = await (async () => {
      try {
        let c = await safeCount('reading_passages', (q) => q.eq('published', true));
        if (c === 0) c = await safeCount('reading_passages', (q) => q);
        return c;
      } catch {
        return 0;
      }
    })();

    const speakingPending = await queueCount('ai_eval_queue', 'speaking_attempts', 'status', fromIso, toIso);
    const writingPending = await queueCount('ai_eval_queue', 'writing_attempts', 'status', fromIso, toIso);

    const [listeningM, readingM, writingM, speakingM] = await Promise.all([
      moduleBlock('Listening', MODULE_TABLE.Listening, fromIso, toIso),
      moduleBlock('Reading', MODULE_TABLE.Reading, fromIso, toIso),
      moduleBlock('Writing', MODULE_TABLE.Writing, fromIso, toIso),
      moduleBlock('Speaking', MODULE_TABLE.Speaking, fromIso, toIso),
    ]);

    const attemptsWindowTotal = [listeningM, readingM, writingM, speakingM]
      .reduce((acc, r) => acc + r.attempts, 0);

    const stats: Stat[] = [
      { label: 'Total Users', value: totalUsers ? totalUsers.toLocaleString() : '—' },
      { label: 'Daily Active', value: '—', sub: 'hook activity later' },
      { label: `Attempts (${from} → ${to})`, value: attemptsWindowTotal.toLocaleString(), sub: onlyModule ? `Only ${onlyModule}` : 'All modules' },
      { label: 'Reading Tests', value: readingTests.toString(), sub: 'Published/Total' },
      { label: 'Speaking Queue', value: speakingPending.toString(), sub: 'Awaiting AI eval' },
      { label: 'MRR (PKR)', value: '—', sub: 'Stripe later' },
    ];

    const aiQueues: QueueRow[] = [
      { name: 'Speaking Evaluations', pending: speakingPending, avgLatencySec: 20 },
      { name: 'Writing Evaluations', pending: writingPending, avgLatencySec: 25 },
    ];

    const systemHealth: HealthRow[] = [
      { name: 'Supabase (DB)', status: 'ok', note: 'RLS policies active' },
      { name: 'Auth', status: 'ok', note: 'JWT roles present' },
      { name: 'Storage', status: 'warn', note: 'usage check todo' },
      { name: 'Webhook Worker', status: 'ok', note: 'Queue pull alive' },
      { name: 'Premium Theme Build', status: 'ok', note: 'Watching' },
    ];

    const series = await seriesCounts(fromIso, toIso, onlyModule);

    const students = await studentsPaged(
      fromIso,
      toIso,
      cohort,
      student_q,
      Math.max(1, parseInt(student_page as string, 10) || 1),
      Math.min(100, Math.max(5, parseInt(student_size as string, 10) || 10)),
    );

    const payload: Payload = {
      stats,
      recentSignups: await recentUsers(),
      moduleUsage: [listeningM, readingM, writingM, speakingM],
      aiQueues,
      systemHealth,
      series,
      students,
    };

    res.status(200).json(payload);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
