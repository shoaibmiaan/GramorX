-- TODO: migration db/migrations/010_challenge_progress.sql
-- 010_challenge_progress.sql
-- Tracks user enrollment and daily task progress in challenges

create table if not exists challenge_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cohort text not null, -- e.g. "BandBoost-Sept2025"
  enrolled_at timestamptz not null default now(),
  progress jsonb default '{}'::jsonb, -- { "day1": true, "day2": false }
  completed boolean not null default false,
  certificate_id uuid references certificates(id),

  constraint uq_user_cohort unique (user_id, cohort)
);

-- Row level security
alter table challenge_enrollments enable row level security;

create policy "Users can manage their own enrollments"
  on challenge_enrollments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for leaderboard
create index if not exists idx_challenge_cohort_user
  on challenge_enrollments (cohort, user_id);
