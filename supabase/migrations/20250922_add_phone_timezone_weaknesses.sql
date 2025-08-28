alter table if exists public.user_profiles
  add column if not exists phone text,
  add column if not exists weaknesses text[] default '{}',
  add column if not exists timezone text;
