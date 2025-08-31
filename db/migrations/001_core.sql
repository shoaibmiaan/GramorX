-- subscriptions, entitlements, usage_counters
create table if not exists public.subscriptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('free','booster','master')),
  status text not null check (status in ('active','trialing','canceled','past_due')),
  source text default 'checkout',
  seats int default 1 check (seats >= 1),
  started_at timestamptz default now(),
  renews_at timestamptz,
  trial_ends_at timestamptz,
  primary key (user_id)
);
alter table public.subscriptions enable row level security;

create table if not exists public.entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);
alter table public.entitlements enable row level security;

create table if not exists public.usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  period_utc_date date not null,
  count int not null default 0,
  primary key (user_id, feature, period_utc_date)
);
alter table public.usage_counters enable row level security;

-- Policies (owner)
do $$ begin
  create policy "subs_owner_rw" on public.subscriptions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "ent_owner_rw" on public.entitlements
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "usage_owner_rw" on public.usage_counters
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Index
create index if not exists idx_usage_user_feature_date on public.usage_counters(user_id, feature, period_utc_date);
