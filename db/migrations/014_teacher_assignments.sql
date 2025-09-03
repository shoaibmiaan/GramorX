-- 014_teacher_assignments.sql
-- Assignments that teachers post to their cohorts

create table if not exists teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references teacher_cohorts(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table teacher_assignments enable row level security;

-- Teacher can manage assignments for cohorts they own
create policy "Teacher manage own cohort assignments"
  on teacher_assignments
  for all
  using (
    exists (
      select 1
      from teacher_cohorts c
      where c.id = teacher_assignments.cohort_id
        and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from teacher_cohorts c
      where c.id = teacher_assignments.cohort_id
        and c.teacher_id = auth.uid()
    )
  );

-- Students in the cohort can view assignments
create policy "Student can view cohort assignments"
  on teacher_assignments
  for select
  using (
    exists (
      select 1
      from teacher_cohort_members m
      where m.cohort_id = teacher_assignments.cohort_id
        and m.student_id = auth.uid()
    )
  );

-- Helpful indexes
create index if not exists idx_teacher_assignments_cohort on teacher_assignments(cohort_id);
create index if not exists idx_teacher_assignments_due on teacher_assignments(due_date);
