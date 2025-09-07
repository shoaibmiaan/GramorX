// File: lib/http.ts//
export type HttpError = { ok: false; status: number; error: string }

export async function api<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'include',
    ...init,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) throw { ok: false, status: res.status, error: data?.error || res.statusText } as HttpError
  return data as T
}

// Optional helper to build query strings safely
export function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    sp.set(k, String(v))
  })
  return sp.toString()
}
