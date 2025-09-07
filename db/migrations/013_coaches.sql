-- 013_coaches.sql
create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  headline text,
  bio text,
  price_per_hour numeric(12,2),
  languages text[] default '{}',
  tags text[] default '{}',
  intro_video_url text,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  is_active boolean default false,
  status text default 'under_review', -- under_review|active|rejected
  review_note text,
  reviewed_by uuid references auth.users(id),
  reviewed_at_utc timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists coaches_user_id_uq on public.coaches(user_id);

alter table public.coaches enable row level security;

-- RLS: coach can see self; public marketplace can read active coaches
create policy "coaches_select_public_active"
on public.coaches for select
to authenticated
using (is_active = true);

create policy "coaches_select_self"
on public.coaches for select
to authenticated
using (user_id = auth.uid());

create policy "coaches_upsert_self"
on public.coaches for insert with check (user_id = auth.uid())
to authenticated;

create policy "coaches_update_self"
on public.coaches for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- admin can do anything
create policy "coaches_admin_all"
on public.coaches for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Availability windows
create table if not exists public.coach_availability (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  start_utc timestamptz not null,
  end_utc timestamptz not null,
  note text,
  created_at timestamptz default now()
);
create index if not exists coach_availability_time_ix on public.coach_availability(coach_id, start_utc, end_utc);

alter table public.coach_availability enable row level security;

create policy "coach_availability_read_public" on public.coach_availability
for select to authenticated
using (exists (select 1 from public.coaches c where c.id = coach_id and (c.is_active = true or c.user_id = auth.uid())));

create policy "coach_availability_write_self" on public.coach_availability
for all to authenticated
using (exists (select 1 from public.coaches c where c.id = coach_id and c.user_id = auth.uid()))
with check (exists (select 1 from public.coaches c where c.id = coach_id and c.user_id = auth.uid()));
