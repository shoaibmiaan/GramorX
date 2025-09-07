// File: pages/reports/band-analytics.tsx
import * as React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { Skeleton } from '@/components/design-system/Skeleton'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'

// This page visualizes IELTS bands and attempt activity across modules for a user (or cohort via userId param).
// Data endpoints expected:
//   GET /api/reports/band-analytics?userId=...&fromUtc=...&toUtc=...
// Response shape:
//   {
//     ok: true,
//     user?: { id: string; name: string; email?: string },
//     bands: Array<{ at: string; module: 'writing'|'speaking'|'reading'|'listening'; overall?: number; r?: number; w?: number; s?: number; l?: number }>,
//     attempts: Array<{ at: string; module: string }>
//   }

// ---------- Utils ----------
function cls(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' ') }
function isoToLocal(iso: string){ if (!iso) return ''; const d=new Date(iso); const pad=(n:number)=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` }
function localToIso(local: string){ if (!local) return ''; const d=new Date(local); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString() }

// ---------- Types ----------
type Resp =
  | { ok: true; user?: { id: string; name: string; email?: string }; bands: Array<{ at: string; module: 'writing'|'speaking'|'reading'|'listening'; overall?: number; r?: number; w?: number; s?: number; l?: number }>; attempts: Array<{ at: string; module: string }> }
  | { ok: false; error: string }

export default function BandAnalyticsPage(){
  const router = useRouter()
  const [userId, setUserId] = React.useState<string>((router.query.userId as string) || '')
  // default window: last 12 weeks
  const now = React.useMemo(()=> new Date(), [])
  const defaultFrom = React.useMemo(()=> new Date(now.getTime() - 84*24*60*60*1000).toISOString(), [now])
  const [fromUtc, setFromUtc] = React.useState<string>((router.query.fromUtc as string) || defaultFrom)
  const [toUtc, setToUtc] = React.useState<string>((router.query.toUtc as string) || now.toISOString())

  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<Resp | null>(null)

  const fetchData = React.useCallback(async ()=>{
    setLoading(true)
    const params = new URLSearchParams()
    if (userId) params.set('userId', userId)
    if (fromUtc) params.set('fromUtc', fromUtc)
    if (toUtc) params.set('toUtc', toUtc)
    const res = await fetch(`/api/institutions/reports?${params}`)
    const json: Resp = await res.json()
    setData(json)
    setLoading(false)
  }, [userId, fromUtc, toUtc])

  React.useEffect(()=>{ fetchData() }, [fetchData])

  // Transform for charts
  const series = React.useMemo(() => {
    if (!data || !('ok' in data) || !data.ok) return { byWeek: [] as any[], attemptsByWeek: [] as any[] }
    // Buckets by week
    const wk = new Map<string, { week: string; writing?: number; speaking?: number; reading?: number; listening?: number; overall?: number }>()
    data.bands.forEach(b => {
      const week = b.at.slice(0,10)
      const row = wk.get(week) || { week }
      if (b.module === 'writing' && typeof b.overall === 'number') row.writing = b.overall
      if (b.module === 'speaking' && typeof b.overall === 'number') row.speaking = b.overall
      if (b.module === 'reading' && typeof b.overall === 'number') row.reading = b.overall
      if (b.module === 'listening' && typeof b.overall === 'number') row.listening = b.overall
      wk.set(week, row)
    })
    const byWeek = Array.from(wk.values()).sort((a,b)=> a.week.localeCompare(b.week))

    const att = new Map<string, { week: string; listening: number; reading: number; writing: number; speaking: number }>()
    data.attempts.forEach(a => {
      const week = a.at.slice(0,10)
      const row = att.get(week) || { week, listening:0, reading:0, writing:0, speaking:0 }
      ;(row as any)[a.module] = (row as any)[a.module] + 1
      att.set(week, row)
    })
    const attemptsByWeek = Array.from(att.values()).sort((a,b)=> a.week.localeCompare(b.week))
    return { byWeek, attemptsByWeek }
  }, [data])

  return (
    <>
      <Head><title>Band Analytics · IELTS Portal</title></Head>
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="font-slab text-2xl md:text-3xl">Band Analytics</h1>
              <Link href="/institutions" className="inline-flex"><Button variant="outline" className="border-border">Back</Button></Link>
            </div>
            <p className="mt-1 text-sm text-mutedText">Track IELTS band progress across modules, plus weekly attempt activity.</p>
          </div>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-7xl px-4 py-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <label className="text-sm text-mutedText">User ID</label>
              <Input value={userId} onChange={(e)=>setUserId(e.target.value)} placeholder="optional — leave blank for me" className="mt-1 rounded-xl border border-border bg-card px-3 py-2" />
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-mutedText">From (UTC)</label>
              <Input type="datetime-local" value={isoToLocal(fromUtc)} onChange={(e)=>setFromUtc(localToIso(e.target.value))} className="mt-1 rounded-xl border border-border bg-card px-3 py-2" />
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-mutedText">To (UTC)</label>
              <Input type="datetime-local" value={isoToLocal(toUtc)} onChange={(e)=>setToUtc(localToIso(e.target.value))} className="mt-1 rounded-xl border border-border bg-card px-3 py-2" />
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button onClick={fetchData} className="w-full bg-accent text-accent-foreground">Apply</Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}

          {!loading && data && 'ok' in data && !data.ok && (
            <div className="rounded-2xl border border-border bg-card p-6 text-sunsetRed">{data.error}</div>
          )}

          {!loading && data && 'ok' in data && data.ok && (
            <>
              {/* Header card */}
              <div className="rounded-2xl border border-lightBorder bg-card p-4">
                <div className="text-sm text-mutedText">User</div>
                <div className="text-xl">{data.user?.name || 'Me'} {data.user?.email ? <span className="text-mutedText text-sm">· {data.user.email}</span> : null}</div>
              </div>

              {/* Attempts per module */}
              <div className="mt-4 rounded-2xl border border-lightBorder bg-card p-4">
                <h3 className="font-slab">Weekly Attempts</h3>
                {series.attemptsByWeek.length === 0 ? (
                  <div className="mt-4"><Skeleton className="h-40 w-full" /></div>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <div className="min-w-[720px]">
                      <BarChart width={720} height={280} data={series.attemptsByWeek}>
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

              {/* Band trend */}
              <div className="mt-4 rounded-2xl border border-lightBorder bg-card p-4">
                <h3 className="font-slab">Band Trend (by module)</h3>
                {series.byWeek.length === 0 ? (
                  <div className="mt-4"><Skeleton className="h-40 w-full" /></div>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <div className="min-w-[720px]">
                      <AreaChart width={720} height={280} data={series.byWeek}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis domain={[0,9]} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="listening" />
                        <Area type="monotone" dataKey="reading" />
                        <Area type="monotone" dataKey="writing" />
                        <Area type="monotone" dataKey="speaking" />
                      </AreaChart>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/practice" className="inline-flex"><Button className="bg-primary text-primary-foreground">Start Practice</Button></Link>
                <Link href="/marketplace" className="inline-flex"><Button variant="outline" className="border-border">Find a Coach</Button></Link>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  )
}
