-- 013_teacher_cohort_delete_policy.sql
-- Allow a teacher to remove members from cohorts they own.

alter table teacher_cohort_members enable row level security;

drop policy if exists "Teacher can remove members" on teacher_cohort_members;

create policy "Teacher can remove members"
  on teacher_cohort_members
  for delete
  using (
    exists (
      select 1
      from teacher_cohorts c
      where c.id = teacher_cohort_members.cohort_id
        and c.teacher_id = auth.uid()
    )
  );
