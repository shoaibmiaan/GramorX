create table if not exists public.mistakes_book (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  mistake text not null,
  correction text,
  type text check (type in ('grammar','vocab')) default 'grammar',
  repetitions integer default 0,
  next_review timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.mistakes_book enable row level security;

create policy "select own mistakes" on public.mistakes_book
  for select using (auth.uid() = user_id);

create policy "insert own mistakes" on public.mistakes_book
  for insert with check (auth.uid() = user_id);

create policy "update own mistakes" on public.mistakes_book
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own mistakes" on public.mistakes_book
  for delete using (auth.uid() = user_id);
