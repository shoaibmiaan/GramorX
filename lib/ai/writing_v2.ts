// File: lib/ai/writing_v2.ts
import { api } from '../http'

export type WritingScoreReq = {
  attemptId: string
  promptId?: string
  text: string
  rubric?: 'band_ielts_v2'
}
export type WritingScoreResp = { ok: true; attemptId: string; score: Record<string, unknown>; feedback: Record<string, unknown> } | { ok: false; error: string }

export async function scoreWriting(body: WritingScoreReq){
  return api<WritingScoreResp>(`/api/ai/writing/score-v2`, { method: 'POST', body: JSON.stringify(body) })
}
