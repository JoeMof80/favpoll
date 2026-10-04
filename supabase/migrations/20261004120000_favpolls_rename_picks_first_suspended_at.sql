-- RENAME: standings_opened_at -> picks_first_suspended_at (founder,
-- 2026-10-04). The column was added a day earlier to open the STANDINGS on
-- a suspension, and by the end of that day a suspension opened the note
-- too: "just treat a suspended poll like it is closed, with note and
-- standings revealed". So the old name described half of what it governs.
--
-- Named for what SETS it rather than for what it opens, so it stays true if
-- the consequence changes again: it is stamped at the FIRST suspension and
-- never cleared, which is the whole point — resuming the picks clears
-- picks_suspended_at, and the reveal must not shut again behind guests who
-- have already seen it.
--
-- "reveal_opened_at" was rejected: personal_reveal became personal_note in
-- #897 and the vocabulary is retired. "unlocked_at" was rejected: the
-- brand forbids pay-to-unlock framing, even internally.
ALTER TABLE favpolls
  RENAME COLUMN standings_opened_at TO picks_first_suspended_at;
