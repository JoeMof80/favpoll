-- SUBSETS, step 6: a topic can leave the PICKER without leaving its
-- favpolls (favpoll-topic-rules §1, ruling 8). `is_active=false` already
-- means "unvetted": the favpoll page hides such a poll from guests. A
-- homemade topic promoted to a subset must stay active — the favpoll
-- that made it keeps its topic and its items in full view — and only
-- stop being offered to the next organiser. That is `is_listed`.
ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS is_listed boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS topics_unlisted ON topics (id) WHERE is_listed = false;
