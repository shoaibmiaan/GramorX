// ================================
// File: pages/classes/index.tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { Skeleton } from '@/components/design-system/Skeleton'
import { listClasses, type ClassRowT } from '@/lib/classes'

// ---------- Utils ----------
function useQueryState<T extends string>(key: string, fallback: T) {
  const router = useRouter()
  const value = (router.query[key] as T) || fallback
  const setValue = (v: T) => {
    const q = new URLSearchParams(router.query as any)
    if (v) q.set(key, v as string); else q.delete(key)
    router.replace({ pathname: router.pathname, query: Object.fromEntries(q) }, undefined, { shallow: true })
  }
  return [value, setValue] as const
}
function cls(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' ') }
function fmtRange(a: string, b: string){ const da=new Date(a), db=new Date(b); return `${da.toUTCString().slice(0,22)} → ${db.toUTCString().slice(17,22)}` }

// ---------- Page ----------
export default function ClassesIndexPage(){
  const router = useRouter()
  const [role, setRole] = useQueryState<'teacher'|'student'>('role', (router.query.role as any) || 'student')
  const [status, setStatus] = useQueryState<'scheduled'|'live'|'completed'|'canceled'|''>('status', (router.query.status as any) || '')
  const [q, setQ] = React.useState<string>((router.query.q as string) || '')
  const [page, setPage] = useQueryState<'1'|string>('page', (router.query.page as any) || '1')
  const [fromUtc, setFromUtc] = React.useState<string>((router.query.fromUtc as string) || '')
  const [toUtc, setToUtc] = React.useState<string>((router.query.toUtc as string) || '')

  const pageNum = Number(page) || 1
  const pageSize = 12

  const [data, setData] = React.useState< { ok: true; items: ClassRowT[]; page: number; pageSize: number; total: number } | { ok: false; error: string } | null >(null)
  const [loading, setLoading] = React.useState(false)

  const fetchData = React.useCallback(async ()=>{
    setLoading(true)
    const json = await listClasses({ role, q, status: status || undefined, fromUtc, toUtc, page: pageNum, pageSize })
    setData(json)
    setLoading(false)
  }, [role, q, status, fromUtc, toUtc, pageNum])

  React.useEffect(()=>{ fetchData() }, [fetchData])

  const total = data && 'ok' in data && data.ok ? data.total : 0
  const max = Math.max(1, Math.ceil(total / pageSize))

  return (
    <>
      <Head><title>Classes · IELTS Portal</title></Head>
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="font-slab text-2xl md:text-3xl">Classes</h1>
              <div className="inline-flex rounded-xl border border-border p-1">
                <button onClick={()=>{setRole('student'); setPage('1')}} className={cls('px-3 py-1 rounded-lg', role==='student'?'bg-primary text-primary-foreground':'hover:bg-lightBg')}>Student</button>
                <button onClick={()=>{setRole('teacher'); setPage('1')}} className={cls('px-3 py-1 rounded-lg', role==='teacher'?'bg-primary text-primary-foreground':'hover:bg-lightBg')}>Teacher</button>
              </div>
            </div>
            <p className="mt-2 text-sm text-mutedText">Join live sessions or manage your upcoming classes.</p>
          </div>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-7xl px-4 py-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <label className="text-sm text-mutedText">Search</label>
              <div className="mt-1 flex items-center gap-2">
                <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Title…" className="w-full rounded-xl border border-border bg-card px-3 py-2 focus-visible:ring-border" />
                <Button onClick={()=>{ setPage('1'); fetchData() }} className="bg-accent text-accent-foreground">Go</Button>
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-mutedText">Status</label>
              <select className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 focus-visible:ring-2 focus-visible:ring-border" value={status} onChange={(e)=>{ setStatus(e.target.value as any); setPage('1') }}> focus-visible:ring-offset-2 focus-visible:ring-offset-background
                <option value="">Any</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-mutedText">From (UTC)</label>
              <Input type="datetime-local" className="mt-1" value={isoToLocal(fromUtc)} onChange={(e)=>setFromUtc(localToIso(e.target.value))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-mutedText">To (UTC)</label>
              <Input type="datetime-local" className="mt-1" value={isoToLocal(toUtc)} onChange={(e)=>setToUtc(localToIso(e.target.value))} />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button onClick={()=>{ setPage('1'); fetchData() }} className="w-full bg-accent text-accent-foreground">Apply</Button>
            </div>
          </div>
        </section>

        {/* List */}
        <section className="mx-auto max-w-7xl px-4 pb-12">
          {loading && (
            <div className="space-y-3">
              {Array.from({length:6}).map((_,i)=> (
                <div key={i} className="rounded-2xl border border-lightBorder bg-card p-4">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="mt-2 h-4 w-64" />
                </div>
              ))}
            </div>
          )}

          {!loading && data && 'ok' in data && data.ok && data.items.length === 0 && (
            <EmptyState title="No classes" subtitle={role==='teacher' ? 'Create a class and share the join link.' : 'Ask your coach for an invite code.'} action={role==='teacher' ? <Link href="/classes/new"><Button className="bg-primary text-primary-foreground">Create Class</Button></Link> : undefined} />
          )}

          {!loading && data && 'ok' in data && data.ok && data.items.length > 0 && (
            <div className="space-y-3">
              {data.items.map((c)=> (
                <ClassRow key={c.id} item={c} />
              ))}
              <Pagination page={pageNum} max={max} onPage={(p)=> setPage(String(p) as any)} />
            </div>
          )}

          {!loading && data && 'ok' in data && !data.ok && (
            <div className="rounded-2xl border border-border bg-card p-6 text-sunsetRed">{data.error}</div>
          )}
        </section>
      </main>
    </>
  )
}

function ClassRow({ item }: { item: ClassRowT }){
  const pill = item.status === 'live' ? 'bg-success/15 text-success' : item.status === 'scheduled' ? 'bg-goldenYellow/15 text-goldenYellow' : item.status === 'completed' ? 'bg-primary/15 text-primary' : 'bg-sunsetRed/15 text-sunsetRed'
  return (
    <Link href={`/classes/${item.id}`} className="block rounded-2xl border border-lightBorder bg-card p-4 hover:shadow-glow transition">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">{item.title}</div>
          <div className="mt-1 text-sm text-mutedText">{fmtRange(item.start_utc, item.end_utc)}</div>
        </div>
        <span className={cls('rounded-lg px-2 py-1 text-xs', pill)}>{item.status}</span>
      </div>
    </Link>
  )
}

function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }){
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <h3 className="font-slab text-xl">{title}</h3>
      {subtitle && <p className="mt-2 text-mutedText">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

function Pagination({ page, max, onPage }: { page: number; max: number; onPage: (p:number)=>void }){
  if (max <= 1) return null
  const pages = Array.from({length:max}).map((_,i)=> i+1)
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {pages.map((p)=> (
        <button key={p} onClick={()=>onPage(p)} className={cls('rounded-lg border border-border px-3 py-1', p===page? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-lightBg')}>{p}</button>
      ))}
    </div>
  )
}

function isoToLocal(iso: string){ if (!iso) return ''; const d=new Date(iso); const pad=(n:number)=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` }
function localToIso(local: string){ if (!local) return ''; const d=new Date(local); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString() }


