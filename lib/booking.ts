// File: lib/booking.ts
import { z as zod } from 'zod'
import { api, qs } from './http'

export const BookingItemSchema = zod.object({
  id: zod.string().uuid(),
  coach_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
  start_utc: zod.string(),
  end_utc: zod.string(),
  status: zod.enum(['pending','confirmed','completed','canceled']),
  note: zod.string().nullable(),
  coach: zod.object({ id: zod.string().uuid(), name: zod.string().nullable().optional(), avatar_url: zod.string().nullable().optional() }).optional(),
})
export type BookingItem = zod.infer<typeof BookingItemSchema>

const ListRespSchema = zod.union([
  zod.object({ ok: zod.literal(true), items: zod.array(BookingItemSchema), page: zod.number(), pageSize: zod.number(), total: zod.number() }),
  zod.object({ ok: zod.literal(false), error: zod.string() })
])
export type ListBookingsResponse = zod.infer<typeof ListRespSchema>

export async function listBookings(opts: { role?: 'student'|'coach'; status?: 'pending'|'confirmed'|'completed'|'canceled'; fromUtc?: string; toUtc?: string; page?: number; pageSize?: number } = {}){
  const query = qs(opts as any)
  const json = await api<ListBookingsResponse>(`/api/bookings/list${query ? `?${query}` : ''}`)
  return ListRespSchema.parse(json)
}

export async function getBooking(id: string){
  // Uses page route for detail navigation; fall back to list and filter
  const list = await listBookings({ page: 1, pageSize: 1 })
  if (list.ok) {
    const hit = list.items.find(b => b.id === id)
    if (hit) return hit
  }
  // or hit a dedicated detail endpoint if present in your API
  try {
    const json = await api<{ ok: boolean; booking?: BookingItem; error?: string }>(`/api/bookings/detail?id=${id}`)
    return json.ok ? json.booking! : null
  } catch { return null }
}

export async function getAvailability(opts: { coachId: string; startUtc: string; endUtc: string }){
  const query = qs(opts)
  const json = await api<{ ok: true; slots: Array<{ startUtc: string; endUtc: string }> } | { ok: false; error: string }>(`/api/bookings/availability?${query}`)
  return json
}

export async function createBooking(body: { coachId: string; startUtc: string; endUtc: string; note?: string }){
  const json = await api<{ ok: true; bookingId: string; status: 'pending'|'confirmed' } | { ok: false; error: string }>(`/api/bookings/create`, { method: 'POST', body: JSON.stringify(body) })
  return json
}

export async function cancelBooking(body: { bookingId: string; reason?: string }){
  const json = await api<{ ok: true; bookingId: string; status: 'canceled' } | { ok: false; error: string }>(`/api/bookings/cancel`, { method: 'POST', body: JSON.stringify(body) })
  return json
}

export async function rescheduleBooking(body: { bookingId: string; newStartUtc: string; newEndUtc: string }){
  const json = await api<{ ok: true; bookingId: string; status: 'pending'|'confirmed' } | { ok: false; error: string }>(`/api/bookings/reschedule`, { method: 'POST', body: JSON.stringify(body) })
  return json
}

