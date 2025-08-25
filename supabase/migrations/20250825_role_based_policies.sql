-- Restrict admin and teacher operations via RLS policies
alter table if exists public.profiles enable row level security;

create policy "Admins can manage profiles"
  on public.profiles
  for all
  using (auth.jwt()->>'role' = 'admin');

create policy "Teachers can view profiles"
  on public.profiles
  for select
  using (auth.jwt()->>'role' in ('teacher','admin'));
