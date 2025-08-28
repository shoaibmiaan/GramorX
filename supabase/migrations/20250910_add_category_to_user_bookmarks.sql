alter table public.user_bookmarks
  add column if not exists category text default 'bookmark';

alter table public.user_bookmarks
  drop constraint if exists user_bookmarks_pkey;

alter table public.user_bookmarks
  add primary key (user_id, resource_id, type, category);
