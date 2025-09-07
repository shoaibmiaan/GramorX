-- 017_proctoring.sql
create table if not exists public.proctoring_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_attempt_id uuid not null,
  started_at_utc timestamptz not null default now(),
  ended_at_utc timestamptz,
  status text not null default 'active', -- active|ended
  precheck_passed boolean,
  device_info_json jsonb
);
create index if not exists proctoring_sessions_user_ix on public.proctoring_sessions(user_id, status);

create table if not exists public.proctoring_events (
  id bigserial primary key,
  session_id uuid not null references public.proctoring_sessions(id) on delete cascade,
  at_utc timestamptz default now(),
  type text not null,
  meta_json jsonb
);
create index if not exists proctoring_events_session_ix on public.proctoring_events(session_id, at_utc);

create table if not exists public.proctoring_flags (
  id bigserial primary key,
  session_id uuid not null references public.proctoring_sessions(id) on delete cascade,
  at_utc timestamptz not null,
  type text not null,
  confidence numeric(3,2) default 0,
  evidence_url text,
  notes text,
  meta_json jsonb
);
create index if not exists proctoring_flags_session_ix on public.proctoring_flags(session_id, at_utc);

create table if not exists public.proctoring_prechecks (
  id bigserial primary key,
  exam_attempt_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at_utc timestamptz default now(),
  device_info_json jsonb,
  permissions_json jsonb,
  network_json jsonb,
  webcam_json jsonb,
  microphone_json jsonb,
  passed boolean,
  reasons text[]
);

alter table public.proctoring_sessions enable row level security;
alter table public.proctoring_events enable row level security;
alter table public.proctoring_flags enable row level security;
alter table public.proctoring_prechecks enable row level security;

-- RLS: owner may read/write their session objects
create policy "proctoring_sessions_owner_all" on public.proctoring_sessions
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "proctoring_events_owner_all" on public.proctoring_events
for all to authenticated
using (exists (select 1 from public.proctoring_sessions s where s.id = session_id and s.user_id = auth.uid()))
with check (exists (select 1 from public.proctoring_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "proctoring_flags_owner_all" on public.proctoring_flags
for all to authenticated
using (exists (select 1 from public.proctoring_sessions s where s.id = session_id and s.user_id = auth.uid()))
with check (exists (select 1 from public.proctoring_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "proctoring_prechecks_owner_all" on public.proctoring_prechecks
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
