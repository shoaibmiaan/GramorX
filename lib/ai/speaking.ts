// lib/ai/speaking.ts
import { env } from '../env';

export interface GradeSpeakingReq {
  transcript?: string;
  audioUrl?: string;   // storage URL if already uploaded
  attemptId?: string;
  persist?: boolean;
}

export type GradeSpeakingRes =
  | {
      ok: true;
      band: number;
      criteria?: Partial<Record<'fluency' | 'lexical' | 'grammar' | 'pronunciation', number>>;
      words?: number;
      tokensUsed?: number;
      notes?: string;
    }
  | { ok: false; error: string; details?: any };

const base =
  typeof window === 'undefined'
    ? env.SITE_URL || env.NEXT_PUBLIC_BASE_URL || ''
    : '';

async function authHeader(): Promise<Record<string, string>> {
  try {
    const { supabaseBrowser } = await import('@/lib/supabaseBrowser');
    const { data } = await supabaseBrowser.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function gradeSpeaking(input: GradeSpeakingReq): Promise<GradeSpeakingRes> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(await authHeader()),
    };
    const r = await fetch(`${base}/api/ai/speaking/grade`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
    const j = await r.json();
    return j as GradeSpeakingRes;
  } catch (e: any) {
    return { ok: false, error: e?.message || 'network_error' };
  }
}
