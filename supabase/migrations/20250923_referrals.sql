-- referrals tables
-- Table to store unique referral code per user
create table if not exists public.referral_codes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text unique not null,
  created_at timestamptz default now()
);

alter table public.referral_codes enable row level security;

create policy "users can view own referral code"
  on public.referral_codes for select
  using (auth.uid() = user_id);

create policy "users can insert own referral code"
  on public.referral_codes for insert
  with check (auth.uid() = user_id);

-- Table to track signups using referral codes
create table if not exists public.referral_signups (
  id bigserial primary key,
  referrer_id uuid references auth.users(id) on delete set null,
  referred_id uuid references auth.users(id) on delete set null,
  reward_credits integer default 0,
  reward_issued boolean default false,
  created_at timestamptz default now()
);

alter table public.referral_signups enable row level security;

create policy "users can view own referrals"
  on public.referral_signups for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

create index if not exists referral_signups_referrer_idx on public.referral_signups(referrer_id);
create index if not exists referral_signups_referred_idx on public.referral_signups(referred_id);
