-- ACCEPTING A NAME THE REGISTER DOES NOT RECOGNISE (step 3 of the
-- verification plan, founder 2026-10-05).
--
-- After the working names landed (#1018) production verifies 40 of 42.
-- The last two are the country-qualifier case — we hold "WWF" and
-- "Médecins Sans Frontières" where the register holds "WWF - UK" and
-- "MEDECINS SANS FRONTIERES (UK)" — and loosening the rule to catch them
-- would also make "Age" match "Age UK", where the UK is the brand. So
-- the answer is a human saying "yes, that's them", once.
--
-- WHY THIS IS A COLUMN AND NOT A STATUS. `verification_status` is the
-- REGISTER'S answer, and the nightly cron recomputes it: an accepted
-- status would be overwritten the same night. Acceptance is a different
-- kind of fact — ours, dated, attributable — so it sits beside the
-- status and survives every re-verification.
--
-- AND WHY IT RECORDS THE NAME. An acceptance is of a specific
-- discrepancy: "our WWF is their WWF - UK". If the register's name later
-- changes, that acceptance was about something else and must lapse — the
-- same reasoning as the profile fingerprints. The accepted name is the
-- comparison, not a copy for display.
alter table charities
  add column if not exists name_accepted_at timestamptz,
  add column if not exists name_accepted_by text,
  add column if not exists name_accepted_name text;

comment on column charities.name_accepted_at is
  'When an admin confirmed that our display name is this charity, despite the register knowing it by another name. Null = never accepted.';
comment on column charities.name_accepted_by is
  'Who accepted it — the admin''s Clerk user id.';
comment on column charities.name_accepted_name is
  'The register name that was accepted. If the register''s name changes, the acceptance lapses and the charity returns to review.';
