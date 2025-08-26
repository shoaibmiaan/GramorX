# Row Level Security Policies

This project relies on PostgreSQL row level security (RLS) through Supabase. The policies ensure that every data access checks the user's JWT `role` claim.

## Profiles
- `Students manage own profile` – students may read and write their profile row when `auth.uid()` matches the row `id` and their JWT role is `student`.
- `Admins can manage profiles` – admins may read or modify any row; both `USING` and `WITH CHECK` clauses require `auth.jwt()->>'role' = 'admin'`.

## Subscriptions
- `Students manage own subscriptions` – access is restricted to the row owner when the JWT role is `student`.
- `Admins manage subscriptions` – full access for admins enforced via `USING` and `WITH CHECK` on the `admin` role.

## Attempt Tables
The tables `reading_attempts`, `listening_attempts`, `writing_attempts`, and `speaking_attempts` share the same policy pattern:
- `Students manage own <table>` – students may read and write their own attempts.
- `Admins manage <table>` – admins have unrestricted access.

All policies use `auth.jwt() ->> 'role'` so future roles can be added consistently.
