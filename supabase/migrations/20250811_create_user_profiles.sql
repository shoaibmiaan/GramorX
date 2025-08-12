-- table
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  country text,
  english_level text check (english_level in ('Beginner','Elementary','Pre-Intermediate','Intermediate','Upper-Intermediate','Advanced')),
  goal_band numeric(2,1) check (goal_band between 4.0 and 9.0),
  study_prefs text[] default '{}',
  time_commitment text check (time_commitment in ('1h/day','2h/day','Flexible')),
  preferred_language text default 'en',
  avatar_url text,
  ai_recommendation jsonb default '{}'::jsonb,
  draft boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_user_profiles_updated on public.user_profiles;
create trigger trg_user_profiles_updated
before update on public.user_profiles
for each row execute procedure public.set_updated_at();

-- RLS
alter table public.user_profiles enable row level security;

-- Policies
create policy "users can select own profile"
on public.user_profiles for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own profile"
on public.user_profiles for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own profile"
on public.user_profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
