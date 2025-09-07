// File: pages/institutions/[orgId]/index.tsx
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { Button } from '@/components/design-system/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabaseServer } from '@/lib/supabaseServer'

// ---------- Types ----------
export type OrgHomeProps = {
  ok: boolean
  error?: string
  org?: { id: string; name: string; code: string | null }
  kpi?: { students: number; active_week: number; avg_band: number | null; mocks_week: number }
}

export const getServerSideProps: GetServerSideProps<OrgHomeProps> = async (ctx) => {
  const { req, res, params } = ctx
  const supabase = supabaseServer(req as any, res as any)
  const orgId = String(params?.orgId)

  const { data: org } = await supabase.from('institutions').select('id, name, code').eq('id', orgId).maybeSingle()
  if (!org) return { props: { ok: false, error: 'Organization not found' } }

  const { data: kpi } = await supabase.from('institution_reports_kpi').select('students, active_week, avg_band, mocks_week').eq('org_id', orgId).maybeSingle()

  return { props: { ok: true, org, kpi: kpi ? { students: kpi.students, active_week: kpi.active_week, avg_band: kpi.avg_band, mocks_week: kpi.mocks_week } : { students: 0, active_week: 0, avg_band: null, mocks_week: 0 } } }
}

export default function OrgHomePage({ ok, error, org, kpi }: OrgHomeProps){
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

  return (
    <>
      <Head><title>{org.name} · Institution</title></Head>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-5xl px-4 py-8">
          <div className="rounded-2xl border border-lightBorder bg-card p-6">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl">{org.name}</h1>
                {org.code && <div className="mt-1 text-sm text-mutedText">Code: {org.code}</div>}
              </div>
              <div className="flex gap-2">
                <Link href={`/institutions/${org.id}/students`} className="inline-flex"><Button className="bg-primary text-primary-foreground">Students</Button></Link>
                <Link href={`/institutions/${org.id}/reports`} className="inline-flex"><Button variant="outline" className="border-border">Reports</Button></Link>
              </div>
            </header>

            {/* KPI Cards */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Students" value={kpi?.students ?? 0} />
              <KpiCard label="Active (7d)" value={kpi?.active_week ?? 0} />
              <KpiCard label="Avg Band" value={kpi?.avg_band ? Number(kpi.avg_band).toFixed(1) : '—'} />
              <KpiCard label="Mocks (7d)" value={kpi?.mocks_week ?? 0} />
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-background p-4 text-sm text-mutedText">
              Use the **Students** and **Reports** tabs to drill down into cohort progress and module-level analytics.
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

function KpiCard({ label, value }: { label: string; value: React.ReactNode }){
  return (
    <div className="rounded-2xl border border-lightBorder bg-card p-4">
      <div className="text-sm text-mutedText">{label}</div>
      <div className="mt-1 text-2xl">{value}</div>
    </div>
  )
}
