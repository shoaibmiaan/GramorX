-- Mood tracking tables

create table if not exists public.mood_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  mood int check (mood between 1 and 10),
  energy int check (energy between 1 and 10),
  note text,
  created_at timestamptz default now()
);

create table if not exists public.weekly_reflections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  week_start date not null,
  reflection text,
  created_at timestamptz default now()
);

-- Row level security
alter table public.mood_logs enable row level security;
create policy "Users manage own mood_logs"
  on public.mood_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.weekly_reflections enable row level security;
create policy "Users manage own weekly_reflections"
  on public.weekly_reflections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
