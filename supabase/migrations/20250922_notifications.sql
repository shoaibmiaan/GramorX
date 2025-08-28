create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  message text not null,
  url text,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users manage own notifications"
  on public.notifications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
