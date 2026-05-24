ALTER TABLE charities
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS market text NOT NULL DEFAULT 'en-GB';

-- All existing charities are en-GB and active
UPDATE charities SET is_active = true, market = 'en-GB';
