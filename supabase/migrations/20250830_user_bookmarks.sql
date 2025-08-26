create table if not exists public.user_bookmarks (
  user_id uuid references auth.users(id) on delete cascade,
  resource_id text not null,
  type text not null,
  created_at timestamptz default now(),
  primary key (user_id, resource_id, type)
);

alter table public.user_bookmarks enable row level security;

create policy "select own bookmarks" on public.user_bookmarks
for select to authenticated
using (auth.uid() = user_id);

create policy "insert own bookmarks" on public.user_bookmarks
for insert with check (auth.uid() = user_id);

create policy "delete own bookmarks" on public.user_bookmarks
for delete using (auth.uid() = user_id);
