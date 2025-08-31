-- Attempts across modules with AI feedback blobs

create table if not exists public.attempts_listening (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paper_id text not null,
  started_at timestamptz default now(),
  submitted_at timestamptz,
  score_json jsonb not null default '{}'::jsonb,
  ai_feedback_json jsonb not null default '{}'::jsonb
);
alter table public.attempts_listening enable row level security;

create table if not exists public.attempts_reading (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paper_id text not null,
  started_at timestamptz default now(),
  submitted_at timestamptz,
  score_json jsonb not null default '{}'::jsonb,
  ai_feedback_json jsonb not null default '{}'::jsonb
);
alter table public.attempts_reading enable row level security;

create table if not exists public.attempts_writing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id text not null,
  started_at timestamptz default now(),
  submitted_at timestamptz,
  content_text text default '',
  score_json jsonb not null default '{}'::jsonb,
  ai_feedback_json jsonb not null default '{}'::jsonb
);
alter table public.attempts_writing enable row level security;

create table if not exists public.attempts_speaking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id text not null,
  started_at timestamptz default now(),
  submitted_at timestamptz,
  audio_url text,
  transcript text,
  score_json jsonb not null default '{}'::jsonb,
  ai_feedback_json jsonb not null default '{}'::jsonb
);
alter table public.attempts_speaking enable row level security;

-- Policies (owner)
do $$ begin
  create policy "att_l_owner_rw" on public.attempts_listening
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "att_r_owner_rw" on public.attempts_reading
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "att_w_owner_rw" on public.attempts_writing
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "att_s_owner_rw" on public.attempts_speaking
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Indexes
create index if not exists idx_att_l_user on public.attempts_listening(user_id);
create index if not exists idx_att_r_user on public.attempts_reading(user_id);
create index if not exists idx_att_w_user on public.attempts_writing(user_id);
create index if not exists idx_att_s_user on public.attempts_speaking(user_id);
