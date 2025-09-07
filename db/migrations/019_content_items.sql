-- 019_content_items.sql
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null, -- reading_paper|listening_test|writing_prompt|speaking_set|lesson
  title text not null,
  metadata_json jsonb default '{}',
  status text not null default 'draft', -- draft|scheduled|published|deleted
  visibility text default 'private', -- private|org|public
  file_path text,
  public_url text,
  published_at_utc timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists content_owner_ix on public.content_items(owner_id, status);

alter table public.content_items enable row level security;

create policy "content_read_owner" on public.content_items
for select to authenticated
using (owner_id = auth.uid());

create policy "content_public_read" on public.content_items
for select to anon, authenticated
using (visibility = 'public' and status = 'published');

create policy "content_owner_all" on public.content_items
for all to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
