-- guest_item_moderation
-- Adds review workflow to topic_items and organiser visibility control to event_poll_items

-- topic_items: canonical review workflow
ALTER TABLE topic_items
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'accepted', 'rejected')),
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by text;

-- Seed items are already canonical — mark them accepted immediately
UPDATE topic_items SET review_status = 'accepted' WHERE source = 'seed';

-- event_poll_items: organiser-level visibility control
ALTER TABLE event_poll_items
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz,
  ADD COLUMN IF NOT EXISTS hidden_by text;  -- clerk user id of organiser who hid the item
