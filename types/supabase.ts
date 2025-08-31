/** Minimal DB types for new tables (Phase 0).
 * Replace with generated types once supabase CLI is wired.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          user_id: string; plan: 'free'|'booster'|'master'; status: 'active'|'trialing'|'canceled'|'past_due';
          source: string | null; seats: number; started_at: string | null; renews_at: string | null; trial_ends_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & { user_id: string; plan: 'free'|'booster'|'master'; status: 'active'|'trialing'|'canceled'|'past_due' };
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
      };
      entitlements: {
        Row: { user_id: string; key: string; value_json: Json; updated_at: string | null };
        Insert: { user_id: string; key: string; value_json?: Json; updated_at?: string | null };
        Update: Partial<Database['public']['Tables']['entitlements']['Row']>;
      };
      usage_counters: {
        Row: { user_id: string; feature: string; period_utc_date: string; count: number };
        Insert: { user_id: string; feature: string; period_utc_date: string; count?: number };
        Update: Partial<Database['public']['Tables']['usage_counters']['Row']>;
      };
      referral_codes: {
        Row: { code: string; owner_user_id: string; reward_days: number; is_active: boolean; created_at: string | null };
        Insert: { code: string; owner_user_id: string; reward_days?: number; is_active?: boolean; created_at?: string | null };
        Update: Partial<Database['public']['Tables']['referral_codes']['Row']>;
      };
      referral_redemptions: {
        Row: { code: string; new_user_id: string; redeemed_at: string };
        Insert: { code: string; new_user_id: string; redeemed_at?: string };
        Update: Partial<Database['public']['Tables']['referral_redemptions']['Row']>;
      };
      partner_accounts: {
        Row: { id: string; org_name: string; contact: Json; rev_share_pct: number; status: 'active'|'inactive' };
        Insert: { id?: string; org_name: string; contact?: Json; rev_share_pct?: number; status?: 'active'|'inactive' };
        Update: Partial<Database['public']['Tables']['partner_accounts']['Row']>;
      };
      partner_codes: {
        Row: { code: string; partner_id: string; discount_pct: number | null; attribution_tag: string | null; is_active: boolean; created_at: string | null };
        Insert: { code: string; partner_id: string; discount_pct?: number | null; attribution_tag?: string | null; is_active?: boolean; created_at?: string | null };
        Update: Partial<Database['public']['Tables']['partner_codes']['Row']>;
      };
      partner_payouts: {
        Row: { id: string; partner_id: string; month: string; amount: number; status: 'pending'|'paid'|'on_hold'; created_at: string | null };
        Insert: { id?: string; partner_id: string; month: string; amount?: number; status?: 'pending'|'paid'|'on_hold'; created_at?: string | null };
        Update: Partial<Database['public']['Tables']['partner_payouts']['Row']>;
      };
      study_plans: {
        Row: { user_id: string; plan_json: Json; created_at: string | null; updated_at: string | null };
        Insert: { user_id: string; plan_json?: Json; created_at?: string | null; updated_at?: string | null };
        Update: Partial<Database['public']['Tables']['study_plans']['Row']>;
      };
      streaks: {
        Row: { user_id: string; last_active_date: string | null; current: number; longest: number; updated_at: string | null };
        Insert: { user_id: string; last_active_date?: string | null; current?: number; longest?: number; updated_at?: string | null };
        Update: Partial<Database['public']['Tables']['streaks']['Row']>;
      };
      notifications_opt_in: {
        Row: { user_id: string; sms_opt_in: boolean; wa_opt_in: boolean; email_opt_in: boolean; updated_at: string | null };
        Insert: { user_id: string; sms_opt_in?: boolean; wa_opt_in?: boolean; email_opt_in?: boolean; updated_at?: string | null };
        Update: Partial<Database['public']['Tables']['notifications_opt_in']['Row']>;
      };
      attempts_listening: {
        Row: { id: string; user_id: string; paper_id: string; started_at: string | null; submitted_at: string | null; score_json: Json; ai_feedback_json: Json };
        Insert: Partial<Omit<Database['public']['Tables']['attempts_listening']['Row'],'id'>> & { id?: string; user_id: string; paper_id: string };
        Update: Partial<Database['public']['Tables']['attempts_listening']['Row']>;
      };
      attempts_reading: {
        Row: { id: string; user_id: string; paper_id: string; started_at: string | null; submitted_at: string | null; score_json: Json; ai_feedback_json: Json };
        Insert: Partial<Omit<Database['public']['Tables']['attempts_reading']['Row'],'id'>> & { id?: string; user_id: string; paper_id: string };
        Update: Partial<Database['public']['Tables']['attempts_reading']['Row']>;
      };
      attempts_writing: {
        Row: { id: string; user_id: string; prompt_id: string; started_at: string | null; submitted_at: string | null; content_text: string | null; score_json: Json; ai_feedback_json: Json };
        Insert: Partial<Omit<Database['public']['Tables']['attempts_writing']['Row'],'id'>> & { id?: string; user_id: string; prompt_id: string };
        Update: Partial<Database['public']['Tables']['attempts_writing']['Row']>;
      };
      attempts_speaking: {
        Row: { id: string; user_id: string; prompt_id: string; started_at: string | null; submitted_at: string | null; audio_url: string | null; transcript: string | null; score_json: Json; ai_feedback_json: Json };
        Insert: Partial<Omit<Database['public']['Tables']['attempts_speaking']['Row'],'id'>> & { id?: string; user_id: string; prompt_id: string };
        Update: Partial<Database['public']['Tables']['attempts_speaking']['Row']>;
      };
      challenge_enrollments: {
        Row: { user_id: string; challenge_id: string; started_at: string | null; progress_json: Json; status: 'active'|'completed'|'abandoned' };
        Insert: { user_id: string; challenge_id?: string; started_at?: string | null; progress_json?: Json; status?: 'active'|'completed'|'abandoned' };
        Update: Partial<Database['public']['Tables']['challenge_enrollments']['Row']>;
      };
      certificates: {
        Row: { id: string; user_id: string; type: string; meta_json: Json; image_url: string | null; created_at: string | null };
        Insert: { id?: string; user_id: string; type: string; meta_json?: Json; image_url?: string | null; created_at?: string | null };
        Update: Partial<Database['public']['Tables']['certificates']['Row']>;
      };
    };
  };
}
