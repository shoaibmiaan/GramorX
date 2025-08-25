-- policies/staff
-- Ensure admin and teacher roles can manage any user profile
create policy "staff can manage all user_profiles" on public.user_profiles
for all to authenticated
using ((auth.jwt() -> 'user_metadata' ->> 'role') in ('admin','teacher'))
with check ((auth.jwt() -> 'user_metadata' ->> 'role') in ('admin','teacher'));
