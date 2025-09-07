// ================================
// File: pages/institutions/[orgId]/students.tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { Skeleton } from '@/components/ui/skeleton'
import { supabaseServer } from '@/lib/supabaseServer'

// ---------- Types ----------
export type StudentsPageProps = {
  ok: boolean
  error?: string
  org?: { id: string; name: string }
}

export const getServerSideProps: GetServerSideProps<StudentsPageProps> = async (ctx) => {
  const { req, res, params } = ctx
  const orgId = String(params?.orgId)
  const supabase = supabaseServer(req as any, res as any)
  const { data: org } = await supabase.from('institutions').select('id, name').eq('id', orgId).maybeSingle()
  if (!org) return { props: { ok: false, error: 'Organization not found' } }
  return { props: { ok: true, org } }
}

// Client-side fetching to leverage filters without SSR recompute
export default function OrgStudentsPage({ ok, error, org }: StudentsPageProps){
  const [q, setQ] = React.useState('')
  const [minAttempts, setMinAttempts] = React.useState('')
  const [sort, setSort] = React.useState<'name' | 'attempts' | 'band'>('name')
  const [page, setPage] = React.useState(1)
  const pageSize = 20

  const [loading, setLoading] = React.useState(false)
  const [rows, setRows] = React.useState<Array<{ user_id: string; full_name: string; email: string; attempts_count: number; latest_band: number | null }>>([])
  const [total, setTotal] = React.useState(0)

  React.useEffect(() => { if (ok && org) fetchData() }, [q, minAttempts, sort, page])

  async function fetchData(){
    if (!org) return
    setLoading(true)
    const params = new URLSearchParams({ orgId: org.id, page: String(page), pageSize: String(pageSize), sort })
    if (q) params.set('q', q)
    if (minAttempts) params.set('minAttempts', minAttempts)
    const res = await fetch(`/api/institutions/students?${params}`)
    const json = await res.json()
    if (json.ok) { setRows(json.items); setTotal(json.total) } else { setRows([]); setTotal(0) }
    setLoading(false)
  }

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

  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  return (
    <>
      <Head><title>{org.name} · Students</title></Head>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="font-slab text-2xl md:text-3xl">Students</h1>
            <Link href={`/institutions/${org.id}`} className="inline-flex"><Button variant="outline" className="border-border">Back</Button></Link>
          </div>
          <p className="mt-1 text-sm text-mutedText">Search and filter your cohort. Click a row for student analytics.</p>
        </section>

        <section className="mx-auto max-w-7xl px-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <label className="text-sm text-mutedText">Search</label>
              <div className="mt-1 flex items-center gap-2">
                <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Name or email…" className="w-full rounded-xl border border-border bg-card px-3 py-2 focus-visible:ring-border" />
                <Button onClick={()=>{ setPage(1); fetchData() }} className="bg-accent text-accent-foreground">Apply</Button>
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-mutedText">Min attempts</label>
              <Input value={minAttempts} onChange={(e)=>setMinAttempts(e.target.value)} placeholder="0" className="mt-1 rounded-xl border border-border bg-card px-3 py-2" />
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-mutedText">Sort</label>
              <select className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 focus:ring-2 focus:ring-border" value={sort} onChange={(e)=>{ setSort(e.target.value as any); setPage(1) }}>
                <option value="name">Name</option>
                <option value="attempts">Attempts</option>
                <option value="band">Latest Band</option>
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-lightBorder">
            <table className="w-full min-w-[760px] divide-y divide-lightBorder">
              <thead className="bg-lightBg">
                <tr className="text-left text-sm text-mutedText">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Attempts</th>
                  <th className="px-4 py-3">Latest Band</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lightBorder bg-card">
                {loading && Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-56" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="ml-auto h-8 w-24 rounded-xl" /></td>
                  </tr>
                ))}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-mutedText">No students match your filters.</td>
                  </tr>
                )}

                {!loading && rows.map((r) => (
                  <tr key={r.user_id} className="hover:bg-lightBg/60">
                    <td className="px-4 py-3">{r.full_name}</td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">{r.attempts_count}</td>
                    <td className="px-4 py-3">{r.latest_band ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/reports/band-analytics?userId=${r.user_id}`} className="inline-flex rounded-xl border border-border bg-background px-3 py-2 text-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {maxPage > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {Array.from({ length: maxPage }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`rounded-lg border border-border px-3 py-1 ${i + 1 === page ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-lightBg'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}


