// ================================
// File: pages/institutions/index.tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { Skeleton } from '@/components/ui/skeleton'

// ---------- Types ----------
type OrgRow = { id: string; name: string; code: string | null; logo_url: string | null }

type OrgsResp =
  | { ok: true; items: OrgRow[] }
  | { ok: false; error: string }

// ---------- Utils ----------
function cls(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' ') }

// ---------- Page ----------
export default function InstitutionsIndexPage(){
  const router = useRouter()
  const [q, setQ] = React.useState<string>((router.query.q as string) || '')
  const [data, setData] = React.useState<OrgsResp | null>(null)
  const [loading, setLoading] = React.useState(false)

  const fetchData = React.useCallback(async ()=>{
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    const res = await fetch(`/api/institutions/orgs?${params}`)
    const json: OrgsResp = await res.json()
    setData(json)
    setLoading(false)
  }, [q])

  React.useEffect(()=>{ fetchData() }, [fetchData])

  return (
    <>
      <Head><title>Institutions · IELTS Portal</title></Head>
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <h1 className="font-slab text-2xl md:text-3xl">Institutions</h1>
            <p className="mt-2 text-sm text-mutedText">Join or manage organizations, view students and run reports.</p>
          </div>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-7xl px-4 py-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="flex items-center gap-2">
              <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search organizations…" className="w-full rounded-xl border border-border bg-card px-3 py-2 focus-visible:ring-border" />
              <Button onClick={fetchData} className="bg-accent text-accent-foreground">Search</Button>
            </div>
            <Link href="/institutions/join" className="inline-flex"><Button className="bg-primary text-primary-foreground">Join by Code</Button></Link>
          </div>
        </section>

        {/* List */}
        <section className="mx-auto max-w-7xl px-4 pb-12">
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({length:6}).map((_,i)=> (
                <div key={i} className="rounded-2xl border border-lightBorder bg-card p-4">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="mt-2 h-4 w-32" />
                </div>
              ))}
            </div>
          )}

          {!loading && data && 'ok' in data && data.ok && data.items.length === 0 && (
            <EmptyState title="No organizations" subtitle="Ask your admin for an invite or join using a code." action={<Link href="/institutions/join"><Button className="bg-primary text-primary-foreground">Join Organization</Button></Link>} />
          )}

          {!loading && data && 'ok' in data && data.ok && data.items.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((org)=> (
                <Link key={org.id} href={`/institutions/${org.id}`} className="block rounded-2xl border border-lightBorder bg-card p-4 hover:shadow-glow transition">
                  <div className="font-medium">{org.name}</div>
                  {org.code && <div className="mt-1 text-sm text-mutedText">Code: {org.code}</div>}
                </Link>
              ))}
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

function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }){
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <h3 className="font-slab text-xl">{title}</h3>
      {subtitle && <p className="mt-2 text-mutedText">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

