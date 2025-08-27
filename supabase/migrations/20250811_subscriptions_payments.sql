-- subscriptions and payments tables

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text not null,
  status text not null check (status in ('active','canceled','incomplete','past_due','unpaid','trialing')),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists trg_subscriptions_updated on public.subscriptions;
create trigger trg_subscriptions_updated
before update on public.subscriptions
for each row execute procedure public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  stripe_payment_intent_id text,
  provider text,
  provider_payment_id text,
  amount integer,
  currency text,
  status text,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create index if not exists payments_user_id_idx on public.payments (user_id);
