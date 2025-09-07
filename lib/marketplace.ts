// File: lib/marketplace.ts
import { z } from 'zod'
import { api, qs } from './http'

export const CoachCardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  headline: z.string().default(''),
  pricePerHour: z.number().nonnegative().default(0),
  rating: z.object({ avg: z.number().default(0), count: z.number().int().default(0) }),
  languages: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
})

export type CoachCard = z.infer<typeof CoachCardSchema>

export const ListCoachesResp = z.union([
  z.object({ ok: z.literal(true), items: z.array(CoachCardSchema), page: z.number(), pageSize: z.number(), total: z.number() }),
  z.object({ ok: z.literal(false), error: z.string() }),
])
export type ListCoachesResponse = z.infer<typeof ListCoachesResp>

export async function listCoaches(opts: { q?: string; lang?: string; sort?: 'rating'|'price'|'new'; page?: number; pageSize?: number } = {}) {
  const query = qs({ q: opts.q, lang: opts.lang, sort: opts.sort, page: opts.page, pageSize: opts.pageSize })
  const json = await api<ListCoachesResponse>(`/api/marketplace/coaches${query ? `?${query}` : ''}`)
  return ListCoachesResp.parse(json)
}

export async function getCoach(id: string) {
  // In our Pages we fetch via SSR; this is a client fallback hitting same endpoint with filter
  const json = await api<ListCoachesResponse>(`/api/marketplace/coaches?coachId=${id}`)
  const parsed = ListCoachesResp.parse(json)
  if (!parsed.ok) return parsed
  const found = parsed.items.find(c => c.id === id) || null
  return found
}

export async function applyAsCoach(body: { headline: string; bio: string; languages: string[]; tags?: string[]; pricePerHour?: number; introVideoUrl?: string }) {
  const json = await api<{ ok: true; coachId: string } | { ok: false; error: string }>(`/api/marketplace/apply`, { method: 'POST', body: JSON.stringify(body) })
  return json
}
