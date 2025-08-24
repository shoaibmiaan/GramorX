import { env } from "@/lib/env";
/**
 * Supabase adapters for Reading.
 * No schema changes required. Adjust table/column names in the mappers to match your existing DB.
 *
 * Usage (later):
 *  - In /api/reading/test/[slug].ts, import getPaperFromSupabase(slug) and use it instead of SAMPLE.
 *  - In /api/reading/submit.ts, import saveAttemptToSupabase(...) to persist attempts.
 */

import { createClient } from '@supabase/supabase-js';

// Prefer service role for secure SSR inserts; fall back to anon for public reads.
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey  = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServer = createClient(supabaseUrl, serviceKey);

/** Shapes used by the Reading runner */
export type Paper = {
  slug: string;
  title: string;
  passage: string;
  durationMinutes: number;
  sections: Array<{
    orderNo: number;
    title?: string;
    instructions?: string;
    questions: Array<{
      id: string;
      qNo: number;
      type: 'mcq'|'tfng'|'ynng'|'gap'|'match';
      prompt: string;
      // optional fields depending on type:
      options?: string[];
      acceptable?: string[];
      correct?: any;
      pairs?: { left: string; right: string }[];
    }>;
  }>;
};

/** Try to fetch a paper from your DB. Return null if not found or on error. */
export async function getPaperFromSupabase(slug: string): Promise<Paper | null> {
  try {
    // --- EXAMPLE QUERIES (rename to your actual tables/columns) ---
    // reading_tests: { slug, title, passage, duration_minutes }
    const { data: tests, error: e1 } = await supabaseServer
      .from('reading_tests')
      .select('slug,title,passage,duration_minutes')
      .eq('slug', slug)
      .limit(1);

    if (e1 || !tests || tests.length === 0) return null;

    const test = tests[0];
    const { data: sections, error: e2 } = await supabaseServer
      .from('reading_sections')
      .select('id, order_no, title, instructions')
      .eq('test_slug', slug)
      .order('order_no', { ascending: true });

    if (e2 || !sections) return null;

    // reading_questions: generic structure with type-specific columns
    const { data: questions, error: e3 } = await supabaseServer
      .from('reading_questions')
      .select('id, section_id, q_no, type, prompt, options, acceptable, correct, pairs')
      .eq('test_slug', slug)
      .order('q_no', { ascending: true });

    if (e3 || !questions) return null;

    // Map DB rows -> runner shape
    const secMap: Record<string, Paper['sections'][0]> = {};
    sections.forEach((s: any) => {
      secMap[s.id] = {
        orderNo: s.order_no,
        title: s.title ?? undefined,
        instructions: s.instructions ?? undefined,
        questions: [],
      };
    });

    questions.forEach((q: any) => {
      const sec = secMap[q.section_id];
      if (!sec) return;
      sec.questions.push({
        id: q.id,
        qNo: q.q_no,
        type: q.type,
        prompt: q.prompt,
        options: q.options ?? undefined,
        acceptable: q.acceptable ?? undefined,
        correct: q.correct ?? undefined,
        pairs: q.pairs ?? undefined,
      });
    });

    const sectionsArr = Object.values(secMap).sort((a, b) => a.orderNo - b.orderNo);

    const paper: Paper = {
      slug: test.slug,
      title: test.title,
      passage: test.passage,
      durationMinutes: test.duration_minutes ?? 20,
      sections: sectionsArr,
    };
    return paper;
  } catch {
    return null;
  }
}

/** Save attempt + answers (adjust table names/columns as needed). */
export async function saveAttemptToSupabase(params: {
  attemptId: string;
  slug: string;
  userId?: string | null;
  answers: Record<string, any>;
  result: { band:number; correctCount:number; total:number };
}) {
  try {
    const { attemptId, slug, userId = null, answers, result } = params;
    // reading_attempts: { id, slug, user_id, band, correct_count, total, answers_json, created_at }
    const { error } = await supabaseServer.from('reading_attempts').insert({
      id: attemptId,
      slug,
      user_id: userId,
      band: result.band,
      correct_count: result.correctCount,
      total: result.total,
      answers_json: answers,
    });
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}
