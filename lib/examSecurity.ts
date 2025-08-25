import { supabase } from '@/lib/supabaseClient';

interface Params {
  exam: string;
  testSlug?: string;
  type?: string;
}

export async function recordFocusViolation(params: Params) {
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id ?? null;
    await supabase.from('exam_focus_violations').insert({
      user_id: userId,
      exam: params.exam,
      test_slug: params.testSlug ?? null,
      type: params.type ?? null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('recordFocusViolation failed', err);
  }
}

