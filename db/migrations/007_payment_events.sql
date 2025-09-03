-- 006_teammates.sql — buddy seats + teammates
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END$$;

-- Buddy seats on profiles
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS buddy_seats       integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buddy_seats_used  integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_buddy_seats_ck'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_buddy_seats_ck CHECK (buddy_seats >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_buddy_seats_used_ck'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_buddy_seats_used_ck CHECK (buddy_seats_used >= 0 AND buddy_seats_used <= buddy_seats);
  END IF;
END$$;

-- Teammates table (owner invites members; supports email invites before signup)
CREATE TABLE IF NOT EXISTS teammates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id     uuid     REFERENCES profiles(id) ON DELETE SET NULL,
  invited_email text,
  role          text NOT NULL DEFAULT 'member'  CHECK (role IN ('member','admin')),
  status        text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','removed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teammates_owner_not_member CHECK (owner_id IS DISTINCT FROM member_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS teammates_owner_member_uniq
  ON teammates(owner_id, member_id)
  WHERE member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS teammates_owner_idx         ON teammates(owner_id);
CREATE INDEX IF NOT EXISTS teammates_member_idx        ON teammates(member_id);
CREATE INDEX IF NOT EXISTS teammates_invited_email_idx ON teammates((lower(invited_email)));
CREATE INDEX IF NOT EXISTS teammates_status_idx        ON teammates(status);

DROP TRIGGER IF EXISTS set_updated_at_on_teammates ON teammates;
CREATE TRIGGER set_updated_at_on_teammates
  BEFORE UPDATE ON teammates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
