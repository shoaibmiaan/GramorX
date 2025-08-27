create table if not exists public.streak_shields (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tokens int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.streak_shields enable row level security;

create policy "read own shields" on public.streak_shields
for select using (auth.uid() = user_id);

create policy "insert own shields" on public.streak_shields
for insert with check (auth.uid() = user_id);

create policy "update own shields" on public.streak_shields
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.streak_shield_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  action text not null check (action in ('claim','use')),
  created_at timestamptz default now()
);

alter table public.streak_shield_logs enable row level security;

create policy "read own shield logs" on public.streak_shield_logs
for select using (auth.uid() = user_id);

create policy "insert own shield logs" on public.streak_shield_logs
for insert with check (auth.uid() = user_id);

-- trigger for updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_streak_shields_updated on public.streak_shields;
create trigger trg_streak_shields_updated
before update on public.streak_shields
for each row execute procedure public.set_updated_at();
