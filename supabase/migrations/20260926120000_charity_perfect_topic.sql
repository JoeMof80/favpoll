-- A charity's PERFECT TOPIC (founder, 2026-09-25): the one favourite a
-- guest sees the point of before pledging ("of course Dogs Trust asks my
-- favourite dog breed"). Mined from the register's objects and
-- activities, suggested by the model, CONFIRMED by an admin; the
-- charity's own reply at onboarding outranks ours. Many charities
-- honestly have none (a hospice, a grant-maker): both columns stay null.
ALTER TABLE charities
  ADD COLUMN IF NOT EXISTS perfect_topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS perfect_topic_suggested_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  -- one plain sentence, for the welcome email and the wizard's label
  ADD COLUMN IF NOT EXISTS perfect_topic_reason text;
