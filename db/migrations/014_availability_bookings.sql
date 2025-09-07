-- 014_availability_bookings.sql
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  start_utc timestamptz not null,
  end_utc timestamptz not null,
  status text not null default 'pending', -- pending|confirmed|completed|canceled
  note text,
  cancel_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists bookings_time_ix on public.bookings(coach_id, start_utc, end_utc);
create index if not exists bookings_user_ix on public.bookings(user_id);

alter table public.bookings enable row level security;

-- student can read own bookings
create policy "bookings_read_self" on public.bookings
for select to authenticated
using (user_id = auth.uid() or exists (select 1 from public.coaches c where c.id = coach_id and c.user_id = auth.uid()));

-- student create their own bookings
create policy "bookings_insert_self" on public.bookings
for insert to authenticated
with check (user_id = auth.uid());

-- student update/cancel their own; coach can update theirs
create policy "bookings_update_owner" on public.bookings
for update to authenticated
using (user_id = auth.uid() or exists (select 1 from public.coaches c where c.id = coach_id and c.user_id = auth.uid()))
with check (user_id = auth.uid() or exists (select 1 from public.coaches c where c.id = coach_id and c.user_id = auth.uid()));
