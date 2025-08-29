-- function to detect password reuse
create or replace function public.password_is_reused(new_password text)
returns boolean
language plpgsql
security definer
as $$
declare
  stored text;
begin
  select encrypted_password into stored
  from auth.users
  where id = auth.uid();

  if stored is null then
    return false;
  end if;

  return stored = crypt(new_password, stored);
end;
$$;

grant execute on function public.password_is_reused(text) to authenticated;
