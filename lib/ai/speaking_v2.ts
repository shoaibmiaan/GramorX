// File: lib/ai/speaking_v2.ts
import { api } from '../http'

export type SpeakingScoreReq = {
  attemptId: string
  audioUrl: string
  locale?: string
  rubric?: 'band_ielts_v2'
}
export type SpeakingScoreResp = { ok: true; attemptId: string; score: Record<string, unknown>; feedback: Record<string, unknown> } | { ok: false; error: string }

export async function scoreSpeaking(body: SpeakingScoreReq){
  return api<SpeakingScoreResp>(`/api/ai/speaking/score-v2`, { method: 'POST', body: JSON.stringify(body) })
}


