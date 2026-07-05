-- Guest-wall identity (anonymity model decided 2026-07-05):
-- display_name is the guest-typed name (signed-in users resolve via
-- users.display_name instead); is_anonymous hides the name from the
-- public wall only — the organiser can always see names for thank-yous,
-- which is disclosed at the point of choice. Anonymous pledges count
-- fully in totals and the record.
ALTER TABLE pledges
  ADD COLUMN display_name text,
  ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;
