-- supabase/migrations/20250901_progress_views.sql
-- views for user progress analytics

-- Band trajectory across skills
drop view if exists progress_band_trajectory;
create view progress_band_trajectory as
select user_id, 'reading' as skill, band, created_at as attempt_date
  from reading_attempts
union all
select user_id, 'listening' as skill, band, submitted_at as attempt_date
  from listening_attempts
union all
select user_id, 'writing' as skill, band, created_at as attempt_date
  from writing_attempts
union all
select user_id, 'speaking' as skill, overall as band, created_at as attempt_date
  from speaking_attempts;

-- Accuracy by question type (reading + listening)
drop view if exists progress_accuracy_per_type;
create view progress_accuracy_per_type as
with answers as (
  select user_id, jsonb_array_elements(answers_json) as ans
  from reading_attempts
  union all
  select user_id, jsonb_array_elements(answers_json) as ans
  from listening_attempts
)
select user_id,
       coalesce(ans->>'type','unknown') as question_type,
       avg((ans->>'correct')::int * 100) as accuracy_pct
from answers
where ans ? 'correct'
group by user_id, question_type;

-- Total time spent per skill
drop view if exists progress_time_spent;
create view progress_time_spent as
select user_id, 'reading' as skill, sum(coalesce(duration_ms,0))/60000 as total_minutes
  from reading_attempts group by user_id
union all
select user_id, 'listening' as skill, sum(coalesce((meta->>'duration_sec')::int,0))/60 as total_minutes
  from listening_attempts group by user_id
union all
select user_id, 'writing' as skill, sum(coalesce(duration_ms,0))/60000 as total_minutes
  from writing_attempts group by user_id
union all
select user_id, 'speaking' as skill, sum(coalesce(duration_sec,0))/60 as total_minutes
  from speaking_attempts group by user_id;
