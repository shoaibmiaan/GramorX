// File: pages/classes/[id].tsx
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { supabaseServer } from '@/lib/supabaseServer'

// ---------- Types ----------
export type ClassPageProps = {
  ok: boolean
  error?: string
  item?: {
    id: string
    teacher_id: string
    title: string
    description: string | null
    start_utc: string
    end_utc: string
    status: 'scheduled'|'live'|'completed'|'canceled'
    meeting_url: string | null
  }
}

export const getServerSideProps: GetServerSideProps<ClassPageProps> = async (ctx) => {
  const { req, res, params } = ctx
  const id = String(params?.id)
  const supabase = supabaseServer(req as any, res as any)
  const { data, error } = await supabase
    .from('classes')
    .select('id, teacher_id, title, description, start_utc, end_utc, status, meeting_url')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return { props: { ok: false, error: 'Class not found' } }
  return { props: { ok: true, item: data as any } }
}

export default function ClassDetailPage({ ok, error, item }: ClassPageProps){
  const [joining, setJoining] = React.useState(false)
  const [token, setToken] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  if (!ok || !item){
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-slab text-2xl">Class not found</h1>
          <p className="mt-2 text-mutedText">It may have been removed.</p>
          <Link href="/classes" className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-primary-foreground">Back to Classes</Link>
        </div>
      </main>
    )
  }

  async function getToken(){
    setJoining(true)
    try {
      const res = await fetch(`/api/classes/join-token?classId=${item.id}`)
      const json = await res.json()
      if (json.ok) setToken(json.token)
    } finally { setJoining(false) }
  }

  async function copy(){ if (!token) return; await navigator.clipboard.writeText(token); setCopied(true); setTimeout(()=>setCopied(false), 1200) }

  const pill = item.status === 'live' ? 'bg-success/15 text-success' : item.status === 'scheduled' ? 'bg-goldenYellow/15 text-goldenYellow' : item.status === 'completed' ? 'bg-primary/15 text-primary' : 'bg-sunsetRed/15 text-sunsetRed'

  return (
    <>
      <Head><title>{item.title} · Class</title></Head>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-lightBorder bg-card p-6">
            <header className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl">{item.title}</h1>
                <div className="mt-1 text-sm text-mutedText">{fmtRange(item.start_utc, item.end_utc)}</div>
              </div>
              <span className={`rounded-lg px-2 py-1 text-xs ${pill}`}>{item.status}</span>
            </header>

            {item.description && (
              <p className="mt-4 whitespace-pre-line text-mutedText">{item.description}</p>
            )}

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Button onClick={getToken} disabled={joining} className="bg-primary text-primary-foreground">{joining ? 'Preparing…' : 'Get Join Token'}</Button>
              {item.meeting_url ? (
                <Link href={item.meeting_url} target="_blank" className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2">Open Meeting</Link>
              ) : (
                <span className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-mutedText">Meeting link unavailable</span>
              )}
            </div>

            {/* Token card */}
            {joining && (
              <div className="mt-4 rounded-2xl border border-lightBorder bg-background p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-3 h-10 w-full rounded-xl" />
              </div>
            )}
            {token && (
              <div className="mt-4 rounded-2xl border border-lightBorder bg-background p-4">
                <div className="text-sm text-mutedText">Your token (share privately):</div>
                <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
                  <Input readOnly value={token} className="rounded-xl border border-border bg-card px-3 py-2" />
                  <Button onClick={copy} className="bg-accent text-accent-foreground">{copied ? 'Copied' : 'Copy'}</Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

function fmtRange(a: string, b: string){ const da=new Date(a), db=new Date(b); return `${da.toUTCString().slice(0,22)} → ${db.toUTCString().slice(17,22)}` }
