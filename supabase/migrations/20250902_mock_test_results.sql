-- Create mock_test_results table
create table if not exists public.mock_test_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  section text not null,
  band numeric(2,1) not null,
  correct int not null,
  total int not null,
  time_taken int not null,
  tab_switches int not null default 0,
  created_at timestamptz default now()
);

alter table public.mock_test_results enable row level security;

create policy "users can select own mock test results"
  on public.mock_test_results for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can insert own mock test results"
  on public.mock_test_results for insert
  to authenticated
  with check (auth.uid() = user_id);
