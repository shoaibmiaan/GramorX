-- Add notification settings and phone to user_profiles
alter table public.user_profiles
  add column if not exists phone text,
  add column if not exists notification_channels text[] default '{}'::text[],
  add column if not exists quiet_hours_start time,
  add column if not exists quiet_hours_end time;
