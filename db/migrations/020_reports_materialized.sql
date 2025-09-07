-- 020_reports_materialized.sql

-- Summary of institution students (view)
drop view if exists public.institution_students_summary;
create view public.institution_students_summary as
select
  m.org_id,
  m.user_id,
  coalesce(p.full_name, 'Student') as full_name,
  p.email,
  m.joined_at,
  (
    select max((score_json->>'overall')::numeric)
    from public.attempts_writing w
    where w.user_id = m.user_id
  ) as latest_band,
  (
    coalesce((select count(*) from public.attempts_listening al where al.user_id = m.user_id),0) +
    coalesce((select count(*) from public.attempts_reading ar where ar.user_id = m.user_id),0) +
    coalesce((select count(*) from public.attempts_writing aw where aw.user_id = m.user_id),0) +
    coalesce((select count(*) from public.attempts_speaking as2 where as2.user_id = m.user_id),0)
  ) as attempts_count
from public.institution_members m
left join public.profiles p on p.id = m.user_id;

alter view public.institution_students_summary owner to postgres;

-- KPI (could be a mat view; start with normal view)
drop view if exists public.institution_reports_kpi;
create view public.institution_reports_kpi as
select
  i.id as org_id,
  (select count(*) from public.institution_members m where m.org_id = i.id) as students,
  (select count(distinct a.user_id)
     from (
       select user_id, created_at from public.attempts_listening
       union all select user_id, created_at from public.attempts_reading
       union all select user_id, created_at from public.attempts_writing
       union all select user_id, created_at from public.attempts_speaking
     ) a
     join public.institution_members m on m.user_id = a.user_id and m.org_id = i.id
     where a.created_at >= now() - interval '7 days'
  ) as active_week,
  (select avg((aw.score_json->>'overall')::numeric)
     from public.attempts_writing aw
     join public.institution_members m on m.user_id = aw.user_id and m.org_id = i.id
  ) as avg_band,
  (select count(*)
     from (
       select user_id, created_at from public.attempts_listening
       union all select user_id, created_at from public.attempts_reading
       union all select user_id, created_at from public.attempts_writing
       union all select user_id, created_at from public.attempts_speaking
     ) a
     join public.institution_members m on m.user_id = a.user_id and m.org_id = i.id
     where a.created_at >= now() - interval '7 days'
  ) as mocks_week
from public.institutions i;

-- Module breakdown (by org, simple rollup)
drop view if exists public.institution_reports_modules;
create view public.institution_reports_modules as
with all_attempts as (
  select 'listening'::text as module, user_id, created_at, null::numeric as score
    from public.attempts_listening
  union all
  select 'reading', user_id, created_at, null::numeric
    from public.attempts_reading
  union all
  select 'writing', user_id, created_at, (score_json->>'overall')::numeric
    from public.attempts_writing
  union all
  select 'speaking', user_id, created_at, null::numeric
    from public.attempts_speaking
)
select
  m.org_id,
  a.module,
  count(*) as attempts,
  avg(a.score) as avg_score,
  date_trunc('week', a.created_at) as bucket_start_utc,
  date_trunc('week', a.created_at) + interval '7 days' as bucket_end_utc
from all_attempts a
join public.institution_members m on m.user_id = a.user_id
group by m.org_id, a.module, date_trunc('week', a.created_at);

-- Grant read via RLS on base tables; views piggyback.
