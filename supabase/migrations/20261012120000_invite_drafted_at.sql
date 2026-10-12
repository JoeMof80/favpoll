-- A COLUMN THAT LIED POLITELY (2026-10-12)
--
-- `consent_contacted_at` named itself after an outcome in the world — this
-- charity has been contacted — but nothing in the system can observe that.
-- The admin button it rides on opens a `mailto:` DRAFT in the operator's own
-- mail client and stamps the column unconditionally, whether or not anything
-- is ever sent. There is no charity email path in the codebase at all:
-- apps/admin has no mail sender, and every function in apps/web/lib/email.ts
-- writes to a guest, an organiser or our own support address.
--
-- It cost us a real mistake. Two production rows carried a stamp from the
-- night the button shipped (#869, 14 Sep, 00:07 and 00:09, two minutes
-- apart), and they were read back as "the two charities we actually
-- contacted" when NO charity had ever been approached. At outreach-wave
-- scale, with hundreds of rows, that misreading would have been routine.
--
-- So the column takes the name of the thing it can actually see. Nothing
-- else changes: it still orders the outreach queue (never-drafted first)
-- and still re-stamps on a second draft.
--
-- Additive first. The deployed admin reads the old name until the build
-- that reads the new one is serving; the drop is a second migration, run by
-- hand afterwards. Both columns are entirely NULL today — the false stamps
-- were cleared on 2026-10-12 — so there is nothing to carry across.
alter table charities
  add column if not exists invite_drafted_at timestamptz;

comment on column charities.invite_drafted_at is
  'When an admin last opened the consent-invite DRAFT for this charity. Records an intention inside admin, NOT a message sent: sending happens in the operator''s own mail client and the app cannot observe it. Never read this as "the charity has been contacted".';
