-- TODO: migration db/migrations/011_teacher_cohorts.sql
-- 011_teacher_cohorts.sql
-- Teacher-student cohorts for B2B pilot

create table if not exists teacher_cohorts (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists teacher_cohort_members (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references teacher_cohorts(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  progress jsonb default '{}'::jsonb
);

-- RLS
alter table teacher_cohorts enable row level security;
alter table teacher_cohort_members enable row level security;

-- Teacher can manage only their own cohorts
create policy "Teacher can manage their cohorts"
  on teacher_cohorts
  for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

-- Teacher can view members in their cohorts
create policy "Teacher can view members"
  on teacher_cohort_members
  for select
  using (
    exists (
      select 1 from teacher_cohorts c
      where c.id = teacher_cohort_members.cohort_id
      and c.teacher_id = auth.uid()
    )
  );

-- Student can view their own membership
create policy "Student can view their membership"
  on teacher_cohort_members
  for select
  using (auth.uid() = student_id);
