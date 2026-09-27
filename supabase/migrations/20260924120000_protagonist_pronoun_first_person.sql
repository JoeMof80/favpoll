-- A protagonist may speak for themselves: pronoun 'i' means the organiser
-- IS the person honoured and the Story is written in the first person
-- ("Mine is Whitby"; a couple says "Ours is"). Founder, 2026-09-24: first
-- person is just another pronoun, not a separate voice.
ALTER TABLE protagonists DROP CONSTRAINT IF EXISTS protagonists_pronoun_check;
ALTER TABLE protagonists
  ADD CONSTRAINT protagonists_pronoun_check
  CHECK (pronoun IN ('he', 'she', 'they', 'i'));
