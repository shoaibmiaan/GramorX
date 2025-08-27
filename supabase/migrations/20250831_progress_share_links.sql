-- Create table for progress share links
create table if not exists public.progress_share_links (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.progress_share_links enable row level security;

-- Allow users to manage their own links
create policy "Users can insert own share links"
  on public.progress_share_links for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view own share links"
  on public.progress_share_links for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow anonymous read access by token
create policy "Anonymous access to share links"
  on public.progress_share_links for select
  to anon
  using (true);
