// ================================
// File: pages/bookings/index.tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { Skeleton } from '@/components/design-system/Skeleton'

// ---------- Types ----------
type BookingItem = {
  id: string
  coach_id: string
  user_id: string
  start_utc: string
  end_utc: string
  status: 'pending' | 'confirmed' | 'completed' | 'canceled'
  note: string | null
  coach?: { id: string; name: string | null; avatar_url: string | null }
}

 type ListResp =
  | { ok: true; items: BookingItem[]; page: number; pageSize: number; total: number }
  | { ok: false; error: string }

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
function fmtRange(a: string, b: string) {
  const da = new Date(a); const db = new Date(b)
  return `${da.toUTCString().slice(0,22)} → ${db.toUTCString().slice(17,22)}`
}

// ---------- Page ----------
export default function BookingsIndexPage(){
  const router = useRouter()
  const [role, setRole] = useQueryState<'student'|'coach'>('role', (router.query.role as any) || 'student')
  const [status, setStatus] = useQueryState<'pending'|'confirmed'|'completed'|'canceled'|''>('status', (router.query.status as any) || '')
  const [page, setPage] = useQueryState<'1'|string>('page', (router.query.page as any) || '1')
  const [fromUtc, setFromUtc] = React.useState<string>((router.query.fromUtc as string) || '')
  const [toUtc, setToUtc] = React.useState<string>((router.query.toUtc as string) || '')
  const pageNum = Number(page) || 1
  const pageSize = 12

  const [data, setData] = React.useState<ListResp | null>(null)
  const [loading, setLoading] = React.useState(false)

  const fetchData = React.useCallback(async ()=>{
    setLoading(true)
    const params = new URLSearchParams({ role, page: String(pageNum), pageSize: String(pageSize) })
    if (status) params.set('status', status)
    if (fromUtc) params.set('fromUtc', fromUtc)
    if (toUtc) params.set('toUtc', toUtc)
    const res = await fetch(`/api/bookings/list?${params}`)
    const json: ListResp = await res.json()
    setData(json)
    setLoading(false)
  }, [role, status, pageNum, fromUtc, toUtc])

  React.useEffect(()=>{ fetchData() }, [fetchData])

  const total = data && 'ok' in data && data.ok ? data.total : 0
  const max = Math.max(1, Math.ceil(total / pageSize))

  return (
    <>
      <Head><title>My Bookings · IELTS Portal</title></Head>
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="font-slab text-2xl md:text-3xl">Bookings</h1>
              <div className="inline-flex rounded-xl border border-border p-1">
                <button onClick={()=>{setRole('student'); setPage('1')}} className={cls('px-3 py-1 rounded-lg', role==='student'?'bg-primary text-primary-foreground':'hover:bg-lightBg')}>Student</button>
                <button onClick={()=>{setRole('coach'); setPage('1')}} className={cls('px-3 py-1 rounded-lg', role==='coach'?'bg-primary text-primary-foreground':'hover:bg-lightBg')}>Coach</button>
              </div>
            </div>
            <p className="mt-2 text-sm text-mutedText">View and manage your sessions. Filter by status and date range.</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-3">
              <label className="text-sm text-mutedText">Status</label>
              <select className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 focus-visible:ring-2 focus-visible:ring-border" value={status} onChange={(e)=>{ setStatus(e.target.value as any); setPage('1') }}> focus-visible:ring-offset-2 focus-visible:ring-offset-background
                <option value="">Any</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-mutedText">From (UTC)</label>
              <Input type="datetime-local" className="mt-1" value={isoToLocal(fromUtc)} onChange={(e)=>setFromUtc(localToIso(e.target.value))} />
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-mutedText">To (UTC)</label>
              <Input type="datetime-local" className="mt-1" value={isoToLocal(toUtc)} onChange={(e)=>setToUtc(localToIso(e.target.value))} />
            </div>
            <div className="md:col-span-3 flex items-end">
              <Button onClick={()=>{ setPage('1'); fetchData() }} className="w-full bg-accent text-accent-foreground">Apply</Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12">
          {loading && (
            <div className="space-y-3">
              {Array.from({length:6}).map((_,i)=> (
                <div key={i} className="rounded-2xl border border-lightBorder bg-card p-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-5 w-64" />
                </div>
              ))}
            </div>
          )}

          {!loading && data && 'ok' in data && data.ok && data.items.length === 0 && (
            <EmptyState title="No bookings" subtitle="When you book a slot with a coach, it will appear here." action={<Link href="/marketplace"><Button className="bg-primary text-primary-foreground">Find a Coach</Button></Link>} />
          )}

          {!loading && data && 'ok' in data && data.ok && data.items.length > 0 && (
            <div className="space-y-3">
              {data.items.map((b)=> (
                <BookingRow key={b.id} item={b} />
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

function BookingRow({ item }: { item: BookingItem }){
  const badge = item.status === 'confirmed' ? 'bg-success/15 text-success'
    : item.status === 'pending' ? 'bg-goldenYellow/15 text-goldenYellow'
    : item.status === 'completed' ? 'bg-primary/15 text-primary'
    : 'bg-sunsetRed/15 text-sunsetRed'
  return (
    <Link href={`/bookings/${item.id}`} className="block rounded-2xl border border-lightBorder bg-card p-4 hover:shadow-glow transition">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-mutedText">{fmtRange(item.start_utc, item.end_utc)}</div>
          <div className="mt-1 font-medium">{item.coach?.name || 'Coach'}</div>
        </div>
        <span className={cls('rounded-lg px-2 py-1 text-xs', badge)}>{item.status}</span>
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
