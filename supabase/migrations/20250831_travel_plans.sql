-- table
create table if not exists public.travel_plans (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  type text check (type in ('travel','festival','exam')) not null,
  created_at timestamptz default now()
);

-- RLS
alter table public.travel_plans enable row level security;

create policy "users select own travel plans"
  on public.travel_plans for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users insert own travel plans"
  on public.travel_plans for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users update own travel plans"
  on public.travel_plans for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users delete own travel plans"
  on public.travel_plans for delete
  to authenticated
  using (auth.uid() = user_id);
