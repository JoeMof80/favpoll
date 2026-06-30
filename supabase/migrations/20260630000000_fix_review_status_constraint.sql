-- Fix review_status check constraint on favourites (was topic_items before rename)
-- Migration 20260604000000 updated existing rows from 'pending' → 'pending_review'
-- but the original CHECK constraint was never updated to match.
-- Backfill any rows still carrying the old 'pending' value before adding the constraint.
UPDATE favourites SET review_status = 'pending_review' WHERE review_status = 'pending';
ALTER TABLE favourites DROP CONSTRAINT IF EXISTS topic_items_review_status_check;
ALTER TABLE favourites DROP CONSTRAINT IF EXISTS favourites_review_status_check;
ALTER TABLE favourites
  ADD CONSTRAINT favourites_review_status_check
  CHECK (review_status IN ('pending_review', 'accepted', 'rejected'));
ALTER TABLE favourites
  ALTER COLUMN review_status SET DEFAULT 'pending_review';
