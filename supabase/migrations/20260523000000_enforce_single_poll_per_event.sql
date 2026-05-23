-- Enforce the product rule: one poll per event.
-- Safe in dev: no events are expected to have multiple polls.
ALTER TABLE event_polls
  ADD CONSTRAINT event_polls_event_id_unique UNIQUE (event_id);
