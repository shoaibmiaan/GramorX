-- 012_certificates_assets.sql
-- Certificates generated after challenge completion

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  enrollment_id uuid references challenge_enrollments(id) on delete cascade,
  image_url text, -- stored asset (Supabase Storage or CDN)
  meta_json jsonb default '{}'::jsonb, -- { "band": 7.5, "cohort": "Sept2025" }
  created_at timestamptz not null default now()
);

-- RLS
alter table certificates enable row level security;

-- Only owner can see their certificate
create policy "User can view own certificate"
  on certificates
  for select
  using (auth.uid() = user_id);

-- Index for fast lookup
create index if not exists idx_cert_user on certificates(user_id);
