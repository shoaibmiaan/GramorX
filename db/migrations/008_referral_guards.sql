-- 007_payment_events.sql — unified payment event log
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS payment_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider    text NOT NULL CHECK (provider IN ('stripe','jazzcash','easypaisa')),
  status      text NOT NULL,
  external_id text,
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate ingest per provider/external id
CREATE UNIQUE INDEX IF NOT EXISTS payment_events_provider_external_id_uq
  ON payment_events(provider, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS payment_events_user_idx       ON payment_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_events_status_idx     ON payment_events(status);
CREATE INDEX IF NOT EXISTS payment_events_created_at_idx ON payment_events(created_at);
CREATE INDEX IF NOT EXISTS payment_events_metadata_gin   ON payment_events USING GIN (metadata);

COMMENT ON TABLE  payment_events              IS 'Normalized log for incoming/outgoing payment events across providers.';
COMMENT ON COLUMN payment_events.metadata     IS 'Arbitrary payload for debugging/audits';

COMMIT;
