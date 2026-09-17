-- The display name a draft was generated WITH (founder, 2026-09-18).
-- Drafts bake the name into the copy ("Marcus' is Porridge" — the house
-- reveal pattern is name-first), so the Story step's name-agnostic ghost
-- fallback needs to know which token to swap for the current wizard's
-- name. Old rows stay null and are simply skipped by the fallback; the
-- exact-key path never needs the swap.
-- Applied to STAGING and PRODUCTION by hand via the dashboard SQL
-- editor (house practice).
alter table generated_drafts
  add column if not exists display_name text;
