-- 016_institutions.sql
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  logo_url text,
  created_at timestamptz default now()
);

create table if not exists public.institution_members (
  org_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'student', -- student|teacher|manager|admin|owner
  joined_at timestamptz default now(),
  primary key (org_id, user_id)
);

create table if not exists public.institution_invites (
  org_id uuid not null references public.institutions(id) on delete cascade,
  email text not null,
  role text not null default 'student',
  invited_by uuid references auth.users(id),
  message text,
  status text default 'pending', -- pending|accepted|expired|revoked
  created_at timestamptz default now(),
  primary key (org_id, email)
);

alter table public.institutions enable row level security;
alter table public.institution_members enable row level security;
alter table public.institution_invites enable row level security;

-- RLS: members can read their org; admins manage
create policy "institutions_read_member" on public.institutions
for select to authenticated
using (exists (select 1 from public.institution_members m where m.org_id = id and m.user_id = auth.uid()));

create policy "institutions_admin_all" on public.institutions
for all to authenticated
using (exists (select 1 from public.institution_members m where m.org_id = id and m.user_id = auth.uid() and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.institution_members m where m.org_id = id and m.user_id = auth.uid() and m.role in ('owner','admin','manager')));

create policy "institution_members_self_read" on public.institution_members
for select to authenticated
using (user_id = auth.uid() or role in ('owner','admin','manager') and exists (select 1 from public.institution_members m where m.org_id = org_id and m.user_id = auth.uid() and m.role in ('owner','admin','manager')));

create policy "institution_members_admin_write" on public.institution_members
for all to authenticated
using (exists (select 1 from public.institution_members m where m.org_id = org_id and m.user_id = auth.uid() and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.institution_members m where m.org_id = org_id and m.user_id = auth.uid() and m.role in ('owner','admin','manager')));

create policy "institution_invites_admin_all" on public.institution_invites
for all to authenticated
using (exists (select 1 from public.institution_members m where m.org_id = org_id and m.user_id = auth.uid() and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.institution_members m where m.org_id = org_id and m.user_id = auth.uid() and m.role in ('owner','admin','manager')));
