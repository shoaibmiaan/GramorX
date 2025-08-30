import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export interface ModuleScore {
  module: string;
  score: number;
}

/** Aggregate scores across different modules for a user */
export async function aggregateScores(userId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('scores')
    .select('module, score')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).reduce((acc: Record<string, number>, { module, score }: any) => {
    acc[module] = (acc[module] || 0) + score;
    return acc;
  }, {});
}

/** Analyse incorrect answers to surface weaknesses and suggestions */
export async function analyzeIncorrectAnswers(userId: string) {
  const { data, error } = await supabase
    .from('mistakes')
    .select('topic')
    .eq('user_id', userId)
    .eq('correct', false);
  if (error) throw error;
  const counts: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    const topic = row.topic || 'general';
    counts[topic] = (counts[topic] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const suggestion = top ? `Focus more on ${top[0]}` : 'Keep up the good work';
  return { counts, suggestion };
}

/** Create a combined report */
export async function generateReport(userId: string) {
  const [scores, analysis] = await Promise.all([
    aggregateScores(userId),
    analyzeIncorrectAnswers(userId),
  ]);
  return { scores, analysis };
}
