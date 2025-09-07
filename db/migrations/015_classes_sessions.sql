-- 015_classes_sessions.sql
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.coaches(id) on delete cascade,
  title text not null,
  description text,
  start_utc timestamptz not null,
  end_utc timestamptz not null,
  status text not null default 'scheduled', -- scheduled|live|completed|canceled
  meeting_url text,
  join_code text,
  join_code_expires_utc timestamptz,
  max_seats int,
  cancel_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists classes_teacher_ix on public.classes(teacher_id, start_utc);

alter table public.classes enable row level security;

-- teacher can manage own classes; students can see those they joined
create policy "classes_teacher_manage" on public.classes
for all to authenticated
using (exists (select 1 from public.coaches c where c.id = teacher_id and c.user_id = auth.uid()))
with check (exists (select 1 from public.coaches c where c.id = teacher_id and c.user_id = auth.uid()));

create table if not exists public.class_members (
  class_id uuid references public.classes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'student', -- student|assistant
  joined_at timestamptz default now(),
  primary key (class_id, user_id)
);

alter table public.class_members enable row level security;

create policy "class_members_student_self" on public.class_members
for select to authenticated
using (user_id = auth.uid() or exists (select 1 from public.classes k join public.coaches c on k.teacher_id = c.id where k.id = class_id and c.user_id = auth.uid()));

create policy "class_members_insert" on public.class_members
for insert to authenticated
with check (user_id = auth.uid() or exists (select 1 from public.classes k join public.coaches c on k.teacher_id = c.id where k.id = class_id and c.user_id = auth.uid()));

create table if not exists public.class_attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_utc timestamptz,
  joined_at_utc timestamptz,
  left_at_utc timestamptz,
  device_json jsonb,
  created_at timestamptz default now()
);
create index if not exists class_attendance_ix on public.class_attendance(class_id, user_id, joined_at_utc);

alter table public.class_attendance enable row level security;

create policy "class_attendance_read" on public.class_attendance
for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.classes k
    join public.coaches c on c.id = k.teacher_id
    where k.id = class_id and c.user_id = auth.uid()
  )
);

create policy "class_attendance_write_self" on public.class_attendance
for insert to authenticated
with check (user_id = auth.uid());
