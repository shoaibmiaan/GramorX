-- Role-based RLS policies for profiles, subscriptions, and attempt tables

-- Profiles
alter table if exists public.profiles enable row level security;
-- ensure admin policy uses with check
drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
  on public.profiles
  for all
  using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

create policy "Students manage own profile"
  on public.profiles
  for all
  using (auth.uid() = id and auth.jwt()->>'role' = 'student')
  with check (auth.uid() = id and auth.jwt()->>'role' = 'student');

-- Subscriptions
alter table if exists public.subscriptions enable row level security;
drop policy if exists "users can view own subscriptions" on public.subscriptions;
create policy "Students manage own subscriptions"
  on public.subscriptions
  for all
  using (auth.uid() = user_id and auth.jwt()->>'role' = 'student')
  with check (auth.uid() = user_id and auth.jwt()->>'role' = 'student');

create policy "Admins manage subscriptions"
  on public.subscriptions
  for all
  using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Reading attempts
alter table if exists public.reading_attempts enable row level security;
create policy "Students manage own reading_attempts"
  on public.reading_attempts
  for all
  using (auth.uid() = user_id and auth.jwt()->>'role' = 'student')
  with check (auth.uid() = user_id and auth.jwt()->>'role' = 'student');

create policy "Admins manage reading_attempts"
  on public.reading_attempts
  for all
  using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Listening attempts
alter table if exists public.listening_attempts enable row level security;
create policy "Students manage own listening_attempts"
  on public.listening_attempts
  for all
  using (auth.uid() = user_id and auth.jwt()->>'role' = 'student')
  with check (auth.uid() = user_id and auth.jwt()->>'role' = 'student');

create policy "Admins manage listening_attempts"
  on public.listening_attempts
  for all
  using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Writing attempts
alter table if exists public.writing_attempts enable row level security;
create policy "Students manage own writing_attempts"
  on public.writing_attempts
  for all
  using (auth.uid() = user_id and auth.jwt()->>'role' = 'student')
  with check (auth.uid() = user_id and auth.jwt()->>'role' = 'student');

create policy "Admins manage writing_attempts"
  on public.writing_attempts
  for all
  using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Speaking attempts
alter table if exists public.speaking_attempts enable row level security;
create policy "Students manage own speaking_attempts"
  on public.speaking_attempts
  for all
  using (auth.uid() = user_id and auth.jwt()->>'role' = 'student')
  with check (auth.uid() = user_id and auth.jwt()->>'role' = 'student');

create policy "Admins manage speaking_attempts"
  on public.speaking_attempts
  for all
  using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');
