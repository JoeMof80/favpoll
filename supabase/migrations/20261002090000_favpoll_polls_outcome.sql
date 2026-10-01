-- THE ENACTED SHAPE (favpoll-topic-rules additions §D, founder 2026-10-02):
-- a favpoll whose guests' picks DECIDE something on the night — the cheese
-- board, the playlist, the game after lunch. The signal is one sentence,
-- "what the picks decide" ("the top five are the board on the night"),
-- in one of two shapes: "the winner is …" or "the top N are …". Filled,
-- the poll is enacted and every rule follows (no personal note, picks
-- close before the night, out of the all-time record, the display's
-- finale types the outcome); empty, it is the memento shape. On the poll,
-- beside the note it replaces. Nothing reads it yet but the wizard,
-- manage and the generator (step 1 of the build).
ALTER TABLE favpoll_polls
  ADD COLUMN IF NOT EXISTS outcome text;
COMMENT ON COLUMN favpoll_polls.outcome IS
  'Enacted shape: what the guests'' picks decide on the night ("the top five are the board"). Null = the memento shape.';
