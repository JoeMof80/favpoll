-- THE STANDINGS OPEN WHEN THE PICKS ARE SUSPENDED (founder, 2026-10-03:
-- "i wonder if it is better to unlock the page when the poll is
-- suspended. the main reason the standings are hidden is so as not to
-- influence picks"). Closing already unlocks the standings for everyone
-- (page.tsx: entitled = pledged OR closed OR organiser) because no pick
-- can follow; suspending creates that same condition early, and the
-- standings freeze besides, so the lock guards a number nothing can move.
--
-- ONE-WAY, which is why this is a column of its own and not read off
-- picks_suspended_at: suspending is reversible by design (one tap, no
-- confirm), but an unlock is not — guests who have seen the standings
-- cannot unsee them, and resuming the picks would otherwise let them pick
-- with knowledge the lock exists to withhold. Stamped the first time the
-- picks are suspended, never cleared. Null = the standings have never
-- been opened.
--
-- The personal note is NOT governed by this: the note is the gift the
-- pledge buys, and suspension exists so the room keeps giving.
ALTER TABLE favpolls ADD COLUMN IF NOT EXISTS standings_opened_at timestamptz;

-- BACKFILL: a favpoll that is suspended RIGHT NOW has its standings open
-- too, so the rule "suspended means the standings are out" holds from the
-- first deploy instead of waiting for the next tap. Favpolls suspended
-- and then resumed before this migration leave no trace to backfill from,
-- and keep their standings shut until the next suspension.
UPDATE favpolls
SET standings_opened_at = picks_suspended_at
WHERE picks_suspended_at IS NOT NULL
  AND standings_opened_at IS NULL;
