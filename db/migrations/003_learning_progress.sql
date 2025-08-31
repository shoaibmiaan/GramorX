-- study plans
create table if not exists public.study_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_json jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.study_plans enable row level security;

-- streaks
create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_active_date date,
  current int not null default 0,
  longest int not null default 0,
  updated_at timestamptz default now()
);
alter table public.streaks enable row level security;

-- notification opt-ins
create table if not exists public.notifications_opt_in (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sms_opt_in boolean not null default false,
  wa_opt_in boolean not null default false,
  email_opt_in boolean not null default true,
  updated_at timestamptz default now()
);
alter table public.notifications_opt_in enable row level security;

-- Policies
do $$ begin
  create policy "study_owner_rw" on public.study_plans
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "streak_owner_rw" on public.streaks
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "notif_owner_rw" on public.notifications_opt_in
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
