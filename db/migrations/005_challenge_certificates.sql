create table if not exists public.challenge_enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null default gen_random_uuid(),
  started_at timestamptz default now(),
  progress_json jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','completed','abandoned')),
  primary key (user_id, challenge_id)
);
alter table public.challenge_enrollments enable row level security;

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  meta_json jsonb not null default '{}'::jsonb,
  image_url text,
  created_at timestamptz default now()
);
alter table public.certificates enable row level security;

-- Policies (owner)
do $$ begin
  create policy "challenge_owner_rw" on public.challenge_enrollments
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cert_owner_rw" on public.certificates
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
