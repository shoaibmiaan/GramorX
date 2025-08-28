-- table
create table if not exists public.study_tasks (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  scheduled_date date not null,
  catch_up boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.study_tasks enable row level security;

create policy "users select own study tasks"
  on public.study_tasks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users insert own study tasks"
  on public.study_tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users update own study tasks"
  on public.study_tasks for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users delete own study tasks"
  on public.study_tasks for delete
  to authenticated
  using (auth.uid() = user_id);
