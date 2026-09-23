-- What a charity is FOR, from the Charity Commission register (2026-09-23).
--
-- A register-added charity arrives with no description, so the generator's
-- only purpose signal was empty and the model guessed the cause from the
-- name (#933 stops the guessing; this supplies the data). The register
-- publishes two things we can already reach:
--
--   activities      the charity's own free-text account of what it does
--                   (charityoverview endpoint). Raw — run-together sentences,
--                   bulleted lists — a source for the prompt, never copy to
--                   display.
--   classification  the What / Who / How codes (allcharitydetails, in a
--                   payload we already fetch and drop). Structured; the
--                   pre-fill for a cause family, and honest about
--                   grant-makers with no cause of their own.
--
-- Both nullable: the register omits them for some charities, and a charity
-- without a registered number has neither. Captured at insert; backfilled
-- for existing rows by scripts/backfill-charity-purpose.ts.

alter table charities
  add column if not exists activities text,
  add column if not exists classification jsonb;

comment on column charities.activities is
  'Charity Commission "activities" text — the charity''s own words. Prompt source only; never displayed raw.';
comment on column charities.classification is
  'Charity Commission who_what_where, normalised to {what:[], who:[], how:[]} of classification_desc strings.';
