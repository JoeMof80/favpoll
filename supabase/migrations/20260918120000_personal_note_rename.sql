-- THE UBIQUITOUS-LANGUAGE RENAME, ERA THREE (founder, 2026-09-18).
-- personal_quote became personal_reveal (20260518000000); the product
-- term is now "personal note" (settled 2026-09-17 after the Yvette
-- session — "Reveal" belongs exclusively to the standings), and the
-- founder chose to align storage while the platform is live but not yet
-- operating — the one cheap moment. Renames are metadata-only.
--
-- DEPLOY CHOREOGRAPHY (non-atomic with code): apply to STAGING first,
-- verify the rename branch on the tunnel, merge, then apply to
-- PRODUCTION as the deploy lands. Old code against the new column (or
-- new against old) 500s on every poll read — acceptable only because
-- nothing is operating.
--
-- Deliberately NOT renamed: topics.placeholders jsonb keys ({about,
-- reveal} — a stored data format), the LLM prompt's JSON field (a
-- creative instrument), message key names, the /features#reveal anchor,
-- and the reveal-foreground design token.
-- Applied by hand via the dashboard SQL editor (house practice).
alter table favpoll_polls rename column personal_reveal to personal_note;
alter table generated_drafts rename column reveal to note;
