create table if not exists public.study_buddies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  buddy_id uuid references auth.users(id) on delete set null,
  timezone text not null,
  goal_band numeric(2,1) check (goal_band between 4.0 and 9.0),
  status text not null default 'waiting',
  matched_at timestamptz,
  created_at timestamptz default now()
);

alter table public.study_buddies enable row level security;

create policy "manage own study_buddy" on public.study_buddies
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "view paired study_buddy" on public.study_buddies
for select
using (auth.uid() = buddy_id);
