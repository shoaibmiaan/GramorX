-- supabase/migrations/20250831_noise_progress.sql
-- store user noise level for listening ladder

create table if not exists public.user_noise_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  noise_level int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_noise_progress enable row level security;

create policy "read own noise progress"
  on public.user_noise_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "upsert own noise progress"
  on public.user_noise_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "update own noise progress"
  on public.user_noise_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- trigger for updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_user_noise_progress_updated on public.user_noise_progress;
create trigger trg_user_noise_progress_updated
before update on public.user_noise_progress
for each row execute procedure public.set_updated_at();
