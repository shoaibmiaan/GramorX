// File: pages/institutions/[orgId]/reports.tsx
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { Button } from '@/components/design-system/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabaseServer } from '@/lib/supabaseServer'
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts'

// ---------- Types ----------
export type ReportsPageProps = {
  ok: boolean
  error?: string
  org?: { id: string; name: string }
  baseline?: { students: number; active_week: number; avg_band: number | null; mocks_week: number }
  seedData?: Array<{ module: string; bucket_start_utc: string; attempts: number; avg_score: number | null }>
}

export const getServerSideProps: GetServerSideProps<ReportsPageProps> = async (ctx) => {
  const { req, res, params } = ctx
  const orgId = String(params?.orgId)
  const supabase = supabaseServer(req as any, res as any)

  const { data: org } = await supabase.from('institutions').select('id, name').eq('id', orgId).maybeSingle()
  if (!org) return { props: { ok: false, error: 'Organization not found' } }

  const { data: kpi } = await supabase.from('institution_reports_kpi').select('students, active_week, avg_band, mocks_week').eq('org_id', orgId).maybeSingle()
  const { data: modules } = await supabase.from('institution_reports_modules').select('module, bucket_start_utc, attempts, avg_score').eq('org_id', orgId).order('bucket_start_utc', { ascending: true })

  const seedData = (modules || []).map((m) => ({ module: m.module, bucket_start_utc: m.bucket_start_utc as any, attempts: m.attempts as any, avg_score: (m.avg_score as any) ?? null }))
  const baseline = kpi ? { students: kpi.students, active_week: kpi.active_week, avg_band: kpi.avg_band, mocks_week: kpi.mocks_week } : { students: 0, active_week: 0, avg_band: null, mocks_week: 0 }

  return { props: { ok: true, org, baseline, seedData } }
}

export default function OrgReportsPage({ ok, error, org, baseline, seedData }: ReportsPageProps){
  const [range, setRange] = React.useState<'8w'|'12w'>('8w')

  if (!ok || !org){
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-slab text-2xl">Organization not found</h1>
          <p className="mt-2 text-mutedText">It may have been removed or you lack access.</p>
          <Link href="/institutions" className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-primary-foreground">Back to Institutions</Link>
        </div>
      </main>
    )
  }

  // Group by week -> pivot per module for charts
  const grouped = React.useMemo(() => {
    const byWeek: Record<string, Record<string, { attempts: number; avg: number | null }>> = {}
    ;(seedData || []).forEach((r) => {
      const wk = r.bucket_start_utc?.slice(0, 10) || 'unknown'
      byWeek[wk] = byWeek[wk] || {}
      byWeek[wk][r.module] = { attempts: r.attempts, avg: r.avg_score }
    })
    const weeks = Object.keys(byWeek).sort()
    const lastN = range === '8w' ? 8 : 12
    const slice = weeks.slice(-lastN)
    return slice.map((w) => ({
      week: w,
      listening: byWeek[w]?.listening?.attempts || 0,
      reading: byWeek[w]?.reading?.attempts || 0,
      writing: byWeek[w]?.writing?.attempts || 0,
      speaking: byWeek[w]?.speaking?.attempts || 0,
      writingAvg: byWeek[w]?.writing?.avg ?? null,
    }))
  }, [seedData, range])

  return (
    <>
      <Head><title>{org.name} · Reports</title></Head>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="font-slab text-2xl md:text-3xl">Reports</h1>
            <Link href={`/institutions/${org.id}`} className="inline-flex"><Button variant="outline" className="border-border">Back</Button></Link>
          </div>
          <p className="mt-1 text-sm text-mutedText">Cohort activity and performance across IELTS modules.</p>

          {/* KPI */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Students" value={baseline?.students ?? 0} />
            <Kpi label="Active (7d)" value={baseline?.active_week ?? 0} />
            <Kpi label="Avg Band" value={baseline?.avg_band ? Number(baseline.avg_band).toFixed(1) : '—'} />
            <Kpi label="Mocks (7d)" value={baseline?.mocks_week ?? 0} />
          </div>

          {/* Range toggle */}
          <div className="mt-4 inline-flex rounded-xl border border-border p-1">
            <button onClick={()=>setRange('8w')} className={`px-3 py-1 rounded-lg ${range==='8w' ? 'bg-primary text-primary-foreground' : 'hover:bg-lightBg'}`}>8 weeks</button>
            <button onClick={()=>setRange('12w')} className={`px-3 py-1 rounded-lg ${range==='12w' ? 'bg-primary text-primary-foreground' : 'hover:bg-lightBg'}`}>12 weeks</button>
          </div>

          {/* Attempts per module (bar) */}
          <div className="mt-6 rounded-2xl border border-lightBorder bg-card p-4">
            <h3 className="font-slab">Weekly Attempts</h3>
            {grouped.length === 0 ? (
              <div className="mt-4"><Skeleton className="h-40 w-full" /></div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[720px]">
                  <BarChart width={720} height={280} data={grouped}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="listening" />
                    <Bar dataKey="reading" />
                    <Bar dataKey="writing" />
                    <Bar dataKey="speaking" />
                  </BarChart>
                </div>
              </div>
            )}
          </div>

          {/* Writing average trend (area) */}
          <div className="mt-6 rounded-2xl border border-lightBorder bg-card p-4">
            <h3 className="font-slab">Writing Average (IELTS band)</h3>
            {grouped.length === 0 ? (
              <div className="mt-4"><Skeleton className="h-40 w-full" /></div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[720px]">
                  <AreaChart width={720} height={280} data={grouped}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 9]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="writingAvg" />
                  </AreaChart>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }){
  return (
    <div className="rounded-2xl border border-lightBorder bg-card p-4">
      <div className="text-sm text-mutedText">{label}</div>
      <div className="mt-1 text-2xl">{value}</div>
    </div>
  )
}
