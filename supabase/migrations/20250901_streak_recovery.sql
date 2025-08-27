create table if not exists public.streak_recovery (
  user_id uuid references auth.users(id) on delete cascade,
  slip_date date not null,
  restart_date date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, slip_date)
);

alter table public.streak_recovery enable row level security;

create policy "read own recovery" on public.streak_recovery
for select to authenticated
using (auth.uid() = user_id);

create policy "upsert own recovery" on public.streak_recovery
for insert with check (auth.uid() = user_id);

create policy "update own recovery" on public.streak_recovery
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trigger for updated_at (reuse function if already created)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_streak_recovery_updated on public.streak_recovery;
create trigger trg_streak_recovery_updated
before update on public.streak_recovery
for each row execute procedure public.set_updated_at();
