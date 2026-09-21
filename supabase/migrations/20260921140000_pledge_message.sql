-- Guest book message (founder, 2026-09-21): a short free-text message
-- shown in the guest book beside the name and pick/amount. Optional,
-- 100-character limit enforced client-side (the column is uncapped so
-- a future increase doesn't need a migration).

ALTER TABLE public.pledges
  ADD COLUMN IF NOT EXISTS message text;

COMMENT ON COLUMN public.pledges.message IS
  'Optional short message shown in the guest book ("Thinking of you"). Null = no message.';
