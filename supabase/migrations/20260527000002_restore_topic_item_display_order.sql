-- Restore display_order on topic_items.
-- NULL means sort alphabetically; integer means sort by this value ascending.
ALTER TABLE topic_items
  ADD COLUMN IF NOT EXISTS display_order integer;
