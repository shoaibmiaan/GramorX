-- Add explanation_language column to user_profiles
alter table if exists public.user_profiles
  add column if not exists explanation_language text default 'en';
