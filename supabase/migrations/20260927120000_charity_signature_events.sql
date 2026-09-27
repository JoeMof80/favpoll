-- A charity's SIGNATURE EVENTS (founder, 2026-09-27): the fundraising
-- events it already holds, read from its own website at insert or
-- backfill (never at Generate). A SUGGESTION for the outreach queue and
-- the welcome email — "we've set up a favpoll for your Coffee Morning".
-- Shape: [{name, kind, when, occasionType, topic, sourceUrl}].
ALTER TABLE charities
  ADD COLUMN IF NOT EXISTS signature_events jsonb,
  ADD COLUMN IF NOT EXISTS website_read_at timestamptz;
