// ================================
// File: pages/marketplace/index.tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'

// ---------- Types ----------
type CoachCardT = {
  id: string
  name: string
  avatarUrl: string | null
  headline: string
  pricePerHour: number
  rating: { avg: number; count: number }
  languages: string[]
  tags: string[]
}

type CoachesResp = {
  ok: true
  items: CoachCardT[]
  page: number
  pageSize: number
  total: number
} | { ok: false; error: string }

// ---------- Utilities ----------
function useQueryState<T extends string>(key: string, fallback: T) {
  const router = useRouter()
  const value = (router.query[key] as T) || fallback
  const setValue = (v: T) => {
    const q = new URLSearchParams(router.query as any)
    q.set(key, v as string)
    router.replace({ pathname: router.pathname, query: Object.fromEntries(q) }, undefined, { shallow: true })
  }
  return [value, setValue] as const
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

// ---------- Page ----------
export default function MarketplacePage() {
  const router = useRouter()
  const [q, setQ] = React.useState<string>((router.query.q as string) || '')
  const [lang, setLang] = useQueryState<'en' | 'ur' | ''>('lang', (router.query.lang as any) || '')
  const [sort, setSort] = useQueryState<'rating' | 'price' | 'new'>('sort', (router.query.sort as any) || 'rating')
  const [page, setPage] = useQueryState<'1' | string>('page', (router.query.page as any) || '1')

  const pageNum = Number(page) || 1
  const pageSize = 12

  const [data, setData] = React.useState<CoachesResp | null>(null)
  const [isLoading, setLoading] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (lang) params.set('lang', lang)
    if (sort) params.set('sort', sort)
    params.set('page', String(pageNum))
    params.set('pageSize', String(pageSize))
    const res = await fetch(`/api/marketplace/coaches?${params.toString()}`)
    const json: CoachesResp = await res.json()
    setData(json)
    setLoading(false)
  }, [q, lang, sort, pageNum])

  React.useEffect(() => { fetchData() }, [fetchData])

  const total = data && 'ok' in data && data.ok ? data.total : 0
  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  return (
    <>
      <Head>
        <title>Coaching Marketplace · IELTS Portal</title>
      </Head>

      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="font-slab text-2xl md:text-3xl">Find your IELTS Coach</h1>
              <Link href="/marketplace/apply" className="rounded-xl bg-primary px-4 py-2 text-primary-foreground shadow-glow">Apply as a Coach</Link>
            </div>
            <p className="mt-2 text-sm text-mutedText">Filter by language, price and rating. Book 1:1 sessions to boost your band quickly.</p>
          </div>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-7xl px-4 py-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <label className="text-sm text-mutedText">Search</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  placeholder="Coach name, tag, headline"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <button onClick={() => { setPage('1'); fetchData() }} className="rounded-xl bg-accent px-3 py-2 text-accent-foreground">Go</button>
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-mutedText">Language</label>
              <select
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2"
                value={lang}
                onChange={(e) => { setLang(e.target.value as any); setPage('1') }}
              >
                <option value="">Any</option>
                <option value="en">English</option>
                <option value="ur">Urdu</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-mutedText">Sort</label>
              <select
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2"
                value={sort}
                onChange={(e) => { setSort(e.target.value as any); setPage('1') }}
              >
                <option value="rating">Top Rated</option>
                <option value="price">Lowest Price</option>
                <option value="new">Newest</option>
              </select>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="mx-auto max-w-7xl px-4 pb-10">
          {isLoading && <div className="rounded-xl border border-border bg-card p-6">Loading coaches…</div>}
          {!isLoading && data && 'ok' in data && data.ok && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((c) => (
                  <CoachCard key={c.id} coach={c} />
                ))}
              </div>
              <Pagination
                page={pageNum}
                max={maxPage}
                onPage={(p) => setPage(String(p) as any)}
              />
            </>
          )}
          {!isLoading && data && 'ok' in data && !data.ok && (
            <div className="rounded-xl border border-border bg-card p-6 text-sunsetRed">{data.error}</div>
          )}
        </section>
      </main>
    </>
  )
}

function CoachCard({ coach }: { coach: CoachCardT }) {
  return (
    <Link href={`/coach/${coach.id}`} className="group block rounded-2xl border border-lightBorder bg-card p-4 hover:shadow-glow transition">
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-lightBg">
          <Image src={coach.avatarUrl || '/avatar.svg'} alt={coach.name} fill sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-medium">{coach.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-mutedText">{coach.headline}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-lg bg-primary/10 px-2 py-1 text-primary">${coach.pricePerHour}/hr</span>
            <span className="rounded-lg bg-goldenYellow/10 px-2 py-1 text-goldenYellow">★ {coach.rating.avg.toFixed(1)} ({coach.rating.count})</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {coach.languages.slice(0, 3).map((l) => (
              <span key={l} className="rounded-lg border border-lightBorder px-2 py-1 text-xs text-mutedText">{l.toUpperCase()}</span>
            ))}
            {coach.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-lg bg-electricBlue/10 px-2 py-1 text-xs text-electricBlue">#{t}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

function Pagination({ page, max, onPage }: { page: number; max: number; onPage: (p: number) => void }) {
  if (max <= 1) return null
  const pages = Array.from({ length: max }).map((_, i) => i + 1)
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={classNames(
            'rounded-lg border border-border px-3 py-1',
            p === page ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-lightBg'
          )}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

