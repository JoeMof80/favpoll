-- SUBSETS, step 2: proposals wait for an admin (favpoll-topic-rules §1,
-- ruling 2: admin-made). The catalogue scan (scripts/propose-subsets.ts)
-- and, later, the charity suggester write rows as `proposed`; the admin
-- approves or rejects on /subsets. Only `approved` subsets reach the
-- picker (step 3). Rows made by hand default to approved.
ALTER TABLE topic_subsets
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved'
    CHECK (status IN ('proposed', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'admin'
    CHECK (source IN ('scan', 'suggester', 'homemade', 'admin')),
  -- One sentence for the admin: why this is a cut people ask for.
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE INDEX IF NOT EXISTS topic_subsets_status ON topic_subsets (status);
