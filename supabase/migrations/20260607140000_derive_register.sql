-- PR-A: derive register from occasion_type; drop the stored column
-- register is now a pure code-level lookup (registerForOccasionType in lib/registers.ts)

-- 1. Backfill occasion_type where null, using per-register defaults
UPDATE events
SET occasion_type = CASE register
  WHEN 'remembering'      THEN 'Remembrance'
  WHEN 'celebrating_one'  THEN 'Celebration'
  WHEN 'celebrating_many' THEN 'Joint celebration'
  WHEN 'cause'            THEN 'Fundraiser'
  ELSE NULL  -- neutral stays null
END
WHERE occasion_type IS NULL;

-- 2. Drop the register column
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_register_check;
ALTER TABLE events DROP COLUMN register;
