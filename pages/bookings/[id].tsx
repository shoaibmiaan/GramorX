
// ================================
// File: pages/bookings/[id].tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import type { GetServerSideProps } from 'next'
import { Button } from '@/components/design-system/Button'
import { supabaseServer } from '@/lib/supabaseServer'

// ---------- Types ----------
export type BookingPageProps = {
  ok: boolean
  error?: string
  booking?: {
    id: string
    coach_id: string
    user_id: string
    start_utc: string
    end_utc: string
    status: 'pending' | 'confirmed' | 'completed' | 'canceled'
    note: string | null
    coach?: { id: string; display_name: string | null; avatar_url: string | null }
  }
}

export const getServerSideProps: GetServerSideProps<BookingPageProps> = async (ctx) => {
  const { req, res, params } = ctx
  const supabase = supabaseServer(req as any, res as any)
  const id = String(params?.id)

  const { data: b, error } = await supabase
    .from('bookings')
    .select('id, coach_id, user_id, start_utc, end_utc, status, note')
    .eq('id', id)
    .maybeSingle()

  if (error || !b) return { props: { ok: false, error: 'Booking not found' } }

  const { data: coach } = await supabase
    .from('coaches')
    .select('id, display_name, avatar_url')
    .eq('id', b.coach_id)
    .maybeSingle()

  return { props: { ok: true, booking: { ...b, coach } } }
}

export default function BookingDetailPage(props: BookingPageProps){
  if (!props.ok || !props.booking){
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-slab text-2xl">Booking not found</h1>
          <p className="mt-2 text-mutedText">It may have been removed.</p>
          <Link href="/bookings" className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-primary-foreground">Back to Bookings</Link>
        </div>
      </main>
    )
  }

  const b = props.booking
  const statusBadge = b.status === 'confirmed' ? 'bg-success/15 text-success'
    : b.status === 'pending' ? 'bg-goldenYellow/15 text-goldenYellow'
    : b.status === 'completed' ? 'bg-primary/15 text-primary'
    : 'bg-sunsetRed/15 text-sunsetRed'

  async function cancel(){
    const res = await fetch('/api/bookings/cancel', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bookingId: b.id, reason: 'User canceled' }) })
    const json = await res.json()
    if (json.ok) location.reload()
  }

  return (
    <>
      <Head><title>Booking · {b.coach?.display_name || 'Coach'}</title></Head>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-lightBorder bg-card p-6">
            <header className="flex items-start gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-lightBg">
                <Image src={b.coach?.avatar_url || '/avatar.svg'} alt="Coach" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl">Session with {b.coach?.display_name || 'Coach'}</h1>
                <div className="mt-1 text-sm text-mutedText">{fmtRange(b.start_utc, b.end_utc)}</div>
              </div>
              <span className={cls('rounded-lg px-2 py-1 text-xs', statusBadge)}>{b.status}</span>
            </header>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Link href={`/coach/${b.coach_id}`} className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2">View Coach</Link>
              {b.status !== 'canceled' && (
                <Link href={`/bookings/reschedule?bookingId=${b.id}`} className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2">Reschedule</Link>
              )}
            </div>

            {b.status !== 'canceled' && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <Button onClick={cancel} variant="destructive" className="bg-sunsetRed text-lightText">Cancel Booking</Button>
                {b.status === 'pending' && <span className="text-sm text-mutedText">Awaiting coach confirmation.</span>}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

function cls(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' ') }
function fmtRange(a: string, b: string){ const da=new Date(a), db=new Date(b); return `${da.toUTCString().slice(0,22)} → ${db.toUTCString().slice(17,22)}` }
