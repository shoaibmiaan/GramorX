export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string; slug: string; title: string; description: string | null;
          track: 'academic'|'general'; level: 'beginner'|'intermediate'|'advanced';
          hero_badge: string | null; is_published: boolean; created_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['courses']['Row'],'id'|'created_at'>> & { slug: string; title: string; track: any; level: any; };
        Update: Partial<Database['public']['Tables']['courses']['Row']>;
      };
      lessons: {
        Row: {
          id: string; course_id: string; slug: string; title: string;
          order_index: number; duration_minutes: number | null;
          prereq_percent: number; content_md: string | null;
          is_published: boolean; created_at: string;
        };
      };
      enrollments: {
        Row: { user_id: string; course_id: string; started_at: string; completed_at: string | null; };
      };
      lesson_progress: {
        Row: { user_id: string; lesson_id: string; status: 'not_started'|'in_progress'|'completed'; progress_pct: number; updated_at: string; };
      };
    };
  };
}
