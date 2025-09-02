// lib/ai/explain.ts
import { env } from '../env';

export type ExplainModule = 'listening' | 'reading' | 'writing' | 'speaking';
export type ExplainType =
  | 'mcq'
  | 'tfng'
  | 'ynng'
  | 'heading'
  | 'matching'
  | 'short'
  | 'gap'
  | 'essay';

export interface ExplainReq {
  module: ExplainModule;
  type: ExplainType;
  question: {
    id: string;
    prompt?: string;
    passageId?: string;
    options?: string[];
    correct?: any;
  };
  userAnswer?: any;
  context?: string; // transcript/passage snippet if available
}

export type ExplainRes =
  | {
      ok: true;
      explanation: string; // markdown/text
      tips?: string[];
      references?: string[];
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

export async function explain(input: ExplainReq): Promise<ExplainRes> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(await authHeader()),
    };
    const r = await fetch(`${base}/api/ai/explain`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
    const j = await r.json();
    return j as ExplainRes;
  } catch (e: any) {
    return { ok: false, error: e?.message || 'network_error' };
  }
}
