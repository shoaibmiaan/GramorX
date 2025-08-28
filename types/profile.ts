export interface AIPlan {
  suggestedGoal?: number;
  etaWeeks?: number;
  sequence?: string[];
  notes?: string[];
}

export interface Profile {
  id?: string;
  user_id?: string;
  full_name?: string | null;
  email?: string | null;
  created_at?: string | null;
  role?: 'student' | 'teacher' | 'admin' | string | null;
  country?: string | null;
  english_level?: string | null;
  goal_band?: number | null;
  study_prefs?: string[] | null;
  time_commitment?: string | null;
  preferred_language?: string | null;
  avatar_url?: string | null;
  exam_date?: string | null;
  ai_recommendation?: AIPlan | null;
  marketing_opt_in?: boolean | null;
  draft?: boolean;
}
