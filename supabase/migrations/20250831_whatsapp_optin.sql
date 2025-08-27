-- whatsapp_optin table to store user phone numbers for whatsapp updates
create table if not exists public.whatsapp_optin (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text not null unique,
  opted_in boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- trigger to keep updated_at fresh
create or replace function public.set_whatsapp_optin_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists trg_whatsapp_optin_updated on public.whatsapp_optin;
create trigger trg_whatsapp_optin_updated
before update on public.whatsapp_optin
for each row execute procedure public.set_whatsapp_optin_updated_at();

alter table public.whatsapp_optin enable row level security;

create policy "select own whatsapp optin" on public.whatsapp_optin
for select using (auth.uid() = user_id);

create policy "insert own whatsapp optin" on public.whatsapp_optin
for insert with check (auth.uid() = user_id);

create policy "update own whatsapp optin" on public.whatsapp_optin
for update using (auth.uid() = user_id);

create policy "delete own whatsapp optin" on public.whatsapp_optin
for delete using (auth.uid() = user_id);
