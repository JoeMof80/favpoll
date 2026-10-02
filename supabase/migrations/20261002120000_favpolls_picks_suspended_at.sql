-- SUSPEND THE PICKS (founder, 2026-10-02). Any favpoll can be suspended:
-- from that moment the pick step disappears and every pledge is a gift
-- with no favourite attached — the shared pot's path — until the close
-- date. Null = picks open; set = suspended, stamped by the server at the
-- tap — no schedule ("the moment the guests are ready to act is the
-- moment to suspend"). The standings freeze because nothing allocates
-- after it. One column, no second close date (the enacted review's
-- revision).
ALTER TABLE favpolls ADD COLUMN IF NOT EXISTS picks_suspended_at timestamptz;
