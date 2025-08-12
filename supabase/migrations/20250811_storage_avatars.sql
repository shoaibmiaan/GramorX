-- Create a public bucket for now (you can switch to private + signed URLs later)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- RLS-like policies for Storage
-- Allow authenticated users to manage only their folder
create policy "avatars read public" on storage.objects
for select using (bucket_id = 'avatars');

create policy "avatars user upload to own folder" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars user update own files" on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars user delete own files" on storage.objects
for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
