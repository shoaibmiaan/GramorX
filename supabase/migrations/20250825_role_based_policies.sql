-- Restrict admin and teacher operations via RLS policies
alter table if exists public.profiles enable row level security;

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
  on public.profiles
  for all
  using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

drop policy if exists "Teachers can view profiles" on public.profiles;
create policy "Teachers can view profiles"
  on public.profiles
  for select
  using (auth.jwt()->>'role' in ('teacher','admin'));
