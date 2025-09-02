// lib/ai/writing.ts
import { env } from '../env';

export type WritingTask = 'task1' | 'task2';

export interface GradeWritingReq {
  text: string;
  task: WritingTask;
  words?: number;
  rubricId?: string;
  attemptId?: string;
  language?: 'en' | 'auto';
  persist?: boolean; // let API decide based on flags
}

export type GradeWritingRes =
  | {
      ok: true;
      band: number; // 0..9
      criteria?: Partial<Record<'task' | 'coherence' | 'lexical' | 'grammar', number>>;
      notes?: string;
      tokensUsed?: number;
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

export async function gradeWriting(input: GradeWritingReq): Promise<GradeWritingRes> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(await authHeader()),
    };
    const r = await fetch(`${base}/api/ai/writing/grade`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
    const j = await r.json();
    return j as GradeWritingRes;
  } catch (e: any) {
    return { ok: false, error: e?.message || 'network_error' };
  }
}
