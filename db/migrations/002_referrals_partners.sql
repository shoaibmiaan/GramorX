-- Referral codes and redemptions
create table if not exists public.referral_codes (
  code text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  reward_days int not null default 14 check (reward_days between 1 and 90),
  is_active boolean not null default true,
  created_at timestamptz default now()
);
alter table public.referral_codes enable row level security;

create table if not exists public.referral_redemptions (
  code text not null references public.referral_codes(code) on delete cascade,
  new_user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (code, new_user_id)
);
alter table public.referral_redemptions enable row level security;

-- Partners, partner codes, payouts
create table if not exists public.partner_accounts (
  id uuid primary key default gen_random_uuid(),
  org_name text not null,
  contact jsonb not null default '{}'::jsonb,
  rev_share_pct numeric(5,2) not null default 20.00,
  status text not null default 'active' check (status in ('active','inactive'))
);
alter table public.partner_accounts enable row level security;

create table if not exists public.partner_codes (
  code text primary key,
  partner_id uuid not null references public.partner_accounts(id) on delete cascade,
  discount_pct numeric(5,2) default 0.00,
  attribution_tag text,
  is_active boolean not null default true,
  created_at timestamptz default now()
);
alter table public.partner_codes enable row level security;

create table if not exists public.partner_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partner_accounts(id) on delete cascade,
  month date not null,
  amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','on_hold')),
  created_at timestamptz default now()
);
alter table public.partner_payouts enable row level security;

-- Basic policies
do $$ begin
  create policy "ref_code_owner_r" on public.referral_codes
    for select using (auth.uid() = owner_user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "ref_code_owner_w" on public.referral_codes
    for insert with check (auth.uid() = owner_user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "ref_redemption_owner_r" on public.referral_redemptions
    for select using (auth.uid() = new_user_id);
exception when duplicate_object then null; end $$;

-- NOTE: partner_* tables are admin/service-role managed; no public policies.
