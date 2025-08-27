-- table
create table if not exists public.visa_targets (
  user_id uuid references auth.users(id) on delete cascade,
  institution text not null,
  target_band numeric(2,1) not null check (target_band between 4.0 and 9.0),
  deadline date,
  created_at timestamptz default now(),
  primary key (user_id, institution)
);

-- RLS
alter table public.visa_targets enable row level security;

-- Policies
create policy "select own visa targets" on public.visa_targets
for select to authenticated
using (auth.uid() = user_id);

create policy "insert own visa targets" on public.visa_targets
for insert with check (auth.uid() = user_id);

create policy "update own visa targets" on public.visa_targets
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "delete own visa targets" on public.visa_targets
for delete using (auth.uid() = user_id);
