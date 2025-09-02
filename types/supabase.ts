// types/supabase.ts
// Table-shaped types used by Supabase client and RLS-safe inserts/updates.

import type { StudyPlan } from './plan';
import type { AnyAttempt } from './attempts';

export interface TableBase {
  id: string;
  created_at: string;  // ISO
  updated_at?: string; // ISO
}

export interface Profiles extends TableBase {
  user_id: string;
  full_name?: string;
  phone?: string;
  goal_band?: number;
  weaknesses?: string[];
  role?: 'student' | 'teacher' | 'admin';
  membership?: 'free' | 'starter' | 'booster' | 'master';
  locale?: string;
}

export interface StudyPlans extends TableBase {
  user_id: string;
  plan_json: StudyPlan;
  start_iso: string;
  weeks: number;
  goal_band?: number;
}

export interface UsageCounters extends TableBase {
  user_id: string;
  date_iso: string; // YYYY-MM-DD
  key: string;      // e.g., "ai.writing.grade"
  count: number;
  plan_snapshot?: string; // plan id at time of increment
}

export interface Attempts extends TableBase {
  user_id: string;
  module: 'listening' | 'reading' | 'writing' | 'speaking';
  exam_id: string;
  payload: AnyAttempt; // full attempt JSON (normalized shape above)
  band?: number;
}

export interface Invoices extends TableBase {
  user_id: string;
  provider: 'stripe' | 'easypaisa' | 'jazzcash';
  status: 'draft' | 'paid' | 'void' | 'refunded' | 'failed';
  amount_minor: number;
  currency: 'USD' | 'PKR';
  provider_ref?: string;
  meta?: Record<string, any>;
}

/** Handy union for typed upserts/selects */
export interface DBSchema {
  profiles: Profiles;
  study_plans: StudyPlans;
  usage_counters: UsageCounters;
  attempts: Attempts;
  invoices: Invoices;
}

export type TableName = keyof DBSchema;
export type RowOf<T extends TableName> = DBSchema[T];
