// File: pages/coach/[id].tsx
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import type { GetServerSideProps } from 'next'
import { supabaseServer } from '@/lib/supabaseServer'

// ---------- Types ----------
export type CoachProfile = {
  id: string
  name: string
  avatarUrl: string | null
  headline: string | null
  bio: string | null
  pricePerHour: number | null
  languages: string[]
  tags: string[]
  rating: { avg: number; count: number }
}

export type CoachPageProps = {
  coach: CoachProfile | null
}

export const getServerSideProps: GetServerSideProps<CoachPageProps> = async (ctx) => {
  const { req, res, query } = ctx
  const supabase = supabaseServer(req as any, res as any)
  const id = String(query.id)
  const { data, error } = await supabase
    .from('coaches')
    .select('id, display_name, avatar_url, headline, bio, price_per_hour, languages, tags, rating_avg, rating_count, is_active')
    .eq('id', id)
    .maybeSingle()

  if (error || !data || data.is_active !== true) {
    return { props: { coach: null } }
  }

  const coach: CoachProfile = {
    id: data.id,
    name: data.display_name ?? 'Coach',
    avatarUrl: data.avatar_url,
    headline: data.headline,
    bio: data.bio,
    pricePerHour: data.price_per_hour,
    languages: data.languages ?? [],
    tags: data.tags ?? [],
    rating: { avg: data.rating_avg ?? 0, count: data.rating_count ?? 0 },
  }

  return { props: { coach } }
}

export default function CoachDetailPage({ coach }: CoachPageProps) {
  const [start, setStart] = React.useState('')
  const [end, setEnd] = React.useState('')
  const [slots, setSlots] = React.useState<Array<{ startUtc: string; endUtc: string }>>([])
  const [loadingSlots, setLoadingSlots] = React.useState(false)

  React.useEffect(() => {
    if (!coach) return
    // default: next 7 days
    const now = new Date()
    const startIso = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    const endIso = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    setStart(startIso)
    setEnd(endIso)
  }, [coach?.id])

  async function loadAvailability() {
    if (!coach || !start || !end) return
    setLoadingSlots(true)
    const params = new URLSearchParams({ coachId: coach.id, startUtc: start, endUtc: end })
    const res = await fetch(`/api/bookings/availability?${params}`)
    const json = await res.json()
    setSlots(json?.slots || [])
    setLoadingSlots(false)
  }

  React.useEffect(() => { loadAvailability() }, [start, end])

  if (!coach) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-slab text-2xl">Coach not found</h1>
          <p className="mt-2 text-mutedText">The profile may be private or inactive.</p>
          <Link className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-primary-foreground" href="/marketplace">Back to Marketplace</Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <Head>
        <title>{coach.name} · IELTS Coach</title>
      </Head>

      <main className="min-h-screen bg-background">
        {/* Header card */}
        <section className="mx-auto max-w-5xl px-4 py-8">
          <div className="rounded-2xl border border-lightBorder bg-card p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-lightBg">
                <Image src={coach.avatarUrl || '/avatar.svg'} alt={coach.name} fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl">{coach.name}</h1>
                {coach.headline && <p className="mt-1 text-mutedText">{coach.headline}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  {coach.pricePerHour != null && (
                    <span className="rounded-lg bg-primary/10 px-2 py-1 text-primary">${coach.pricePerHour}/hr</span>
                  )}
                  <span className="rounded-lg bg-goldenYellow/10 px-2 py-1 text-goldenYellow">★ {coach.rating.avg.toFixed(1)} ({coach.rating.count})</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {coach.languages.map((l) => (
                    <span key={l} className="rounded-lg border border-lightBorder px-2 py-1 text-xs text-mutedText">{l.toUpperCase()}</span>
                  ))}
                  {coach.tags.map((t) => (
                    <span key={t} className="rounded-lg bg-electricBlue/10 px-2 py-1 text-xs text-electricBlue">#{t}</span>
                  ))}
                </div>
              </div>
              <div className="md:w-56">
                <Link href="#booking" className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-primary-foreground shadow-glow">Book a Session</Link>
                <Link href="/marketplace" className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-2">Back</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bio / About */}
        {coach.bio && (
          <section className="mx-auto max-w-5xl px-4">
            <div className="rounded-2xl border border-lightBorder bg-card p-6">
              <h2 className="font-slab text-xl">About</h2>
              <p className="mt-2 whitespace-pre-line text-mutedText">{coach.bio}</p>
            </div>
          </section>
        )}

        {/* Availability & Booking */}
        <section id="booking" className="mx-auto max-w-5xl px-4 py-8">
          <div className="rounded-2xl border border-lightBorder bg-card p-6">
            <h2 className="font-slab text-xl">Availability</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="text-sm text-mutedText">From (UTC)
                <input type="datetime-local" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" value={isoToLocal(start)} onChange={(e) => setStart(localToIso(e.target.value))} />
              </label>
              <label className="text-sm text-mutedText">To (UTC)
                <input type="datetime-local" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" value={isoToLocal(end)} onChange={(e) => setEnd(localToIso(e.target.value))} />
              </label>
              <div className="flex items-end">
                <button onClick={loadAvailability} className="w-full rounded-xl bg-accent px-4 py-2 text-accent-foreground">Refresh</button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {loadingSlots && <div className="rounded-xl border border-border bg-background p-4">Loading slots…</div>}
              {!loadingSlots && slots.length === 0 && (
                <div className="rounded-xl border border-border bg-background p-4">No free slots in this range.</div>
              )}
              {!loadingSlots && slots.map((s) => (
                <BookCard key={`${s.startUtc}-${s.endUtc}`} coachId={coach.id} startUtc={s.startUtc} endUtc={s.endUtc} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

function BookCard({ coachId, startUtc, endUtc }: { coachId: string; startUtc: string; endUtc: string }) {
  const [busy, setBusy] = React.useState(false)
  const [done, setDone] = React.useState<null | { id: string; status: string }>(null)

  async function book() {
    setBusy(true)
    const res = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coachId, startUtc, endUtc })
    })
    const json = await res.json()
    setBusy(false)
    if (json.ok) setDone({ id: json.bookingId, status: json.status })
  }

  return (
    <div className="rounded-2xl border border-lightBorder bg-background p-4">
      <div className="text-sm text-mutedText">{fmtRange(startUtc, endUtc)}</div>
      {done ? (
        <Link href={`/bookings/${done.id}`} className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-success px-3 py-2 text-lightText">View Booking</Link>
      ) : (
        <button onClick={book} disabled={busy} className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-primary-foreground shadow-glow disabled:opacity-50">{busy ? 'Booking…' : 'Book this slot'}</button>
      )}
    </div>
  )
}

// ---------- Helpers ----------
function isoToLocal(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function localToIso(local: string) {
  if (!local) return ''
  const d = new Date(local)
  return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString()
}
function fmtRange(a: string, b: string) {
  const da = new Date(a), db = new Date(b)
  return `${da.toUTCString().slice(0, 22)} → ${db.toUTCString().slice(17, 22)}`
}
