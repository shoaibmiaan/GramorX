// File: lib/proctoring.ts
import { api } from './http'

export type PrecheckBody = {
  examAttemptId: string
  device?: { ua?: string; platform?: string; os?: string; browser?: string }
  permissions?: { camera?: boolean; microphone?: boolean; screen?: boolean; notifications?: boolean }
  network?: { downKbps?: number; upKbps?: number; rttMs?: number; jitterMs?: number; packetLoss?: number }
  webcam?: { width?: number; height?: number; fps?: number }
  microphone?: { levelDb?: number; noiseDb?: number }
}

export async function precheck(body: PrecheckBody){
  return api<{ ok: true; examAttemptId: string; passed: boolean; reasons: string[] } | { ok: false; error: string }>(`/api/proctoring/check`, { method: 'POST', body: JSON.stringify(body) })
}

export async function startSession(body: { attemptId: string }){
  return api<{ ok: true; sessionId: string } | { ok: false; error: string }>(`/api/proctoring/start`, { method: 'POST', body: JSON.stringify(body) })
}

export async function verifyFrame(body: { sessionId: string; imageBase64: string; tsUtc?: string }){
  return api<{ ok: true; verified: boolean; confidence?: number } | { ok: false; error: string }>(`/api/proctoring/verify`, { method: 'POST', body: JSON.stringify(body) })
}

export async function sendFlag(body: { sessionId: string; type: string; confidence?: number; notes?: string; evidenceUrl?: string; meta?: Record<string, unknown> }){
  return api<{ ok: true } | { ok: false; error: string }>(`/api/proctoring/flags`, { method: 'POST', body: JSON.stringify(body) })
}

