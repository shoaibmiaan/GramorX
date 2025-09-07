// File: lib/classes.ts
import { z as Z } from 'zod'
import { api, qs } from './http'

export const ClassRow = Z.object({
  id: Z.string().uuid(),
  teacher_id: Z.string().uuid(),
  title: Z.string(),
  description: Z.string().nullable(),
  start_utc: Z.string(),
  end_utc: Z.string(),
  status: Z.enum(['scheduled','live','completed','canceled']),
  meeting_url: Z.string().nullable(),
})
export type ClassRowT = Z.infer<typeof ClassRow>

export async function listClasses(opts: { role?: 'teacher'|'student'; q?: string; status?: 'scheduled'|'live'|'completed'|'canceled'; fromUtc?: string; toUtc?: string; page?: number; pageSize?: number } = {}){
  const query = qs(opts as any)
  return api<{ ok: true; items: ClassRowT[]; page: number; pageSize: number; total: number } | { ok: false; error: string }>(`/api/classes/list${query ? `?${query}` : ''}`)
}

export async function createClass(body: { title: string; description?: string; startUtc: string; endUtc: string; meetingUrl?: string; maxSeats?: number }){
  return api<{ ok: true; classId: string } | { ok: false; error: string }>(`/api/classes/create`, { method: 'POST', body: JSON.stringify(body) })
}

export async function cancelClass(body: { classId: string; reason?: string }){
  return api<{ ok: true; classId: string; status: 'canceled' } | { ok: false; error: string }>(`/api/classes/cancel`, { method: 'POST', body: JSON.stringify(body) })
}

export async function getJoinToken(classId: string){
  return api<{ ok: true; classId: string; token: string; expiresAt: string } | { ok: false; error: string }>(`/api/classes/join-token?classId=${classId}`)
}

export async function markAttendance(body: { classId: string; joinedAtUtc: string; leftAtUtc?: string; device?: Record<string, unknown> }){
  return api<{ ok: true } | { ok: false; error: string }>(`/api/classes/attendance`, { method: 'POST', body: JSON.stringify(body) })
}

