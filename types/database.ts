// types/database.ts (addon types for speaking tables)
export type SpeakingAttempt = {
  id: string;
  user_id: string;
  part: 'p1'|'p2'|'p3'|'chat';
  duration_ms: number | null;
  audio_path: string;
  created_at: string;
};

export type SpeakingFeedback = {
  attempt_id: string;
  band_overall: number;
  bands: { fluency:number; coherence:number; lexical:number; grammar:number; pronunciation:number };
  transcript: string;
  tips: string[];
  created_at: string;
};
