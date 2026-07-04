-- Charity Commission verification state. Populated by the admin app when a
-- registered number is entered, and refreshed by the verify-charities cron.
-- null verification_status = never checked (e.g. no registered number).
ALTER TABLE charities
  ADD COLUMN verification_status text
    CHECK (verification_status IN ('verified', 'name_mismatch', 'not_found', 'removed', 'error')),
  ADD COLUMN verified_name text,
  ADD COLUMN verified_at timestamptz;
