-- Charity CONSENT status (the consent gate — founder go, 2026-09-07).
-- Distinct from verification_status (is this a real registered charity?):
-- consent_status records whether the charity has AGREED to appear on
-- favpoll and receive pledges — the PF/CP posture question (see
-- references/pfcp-instruction-letter-DRAFT-2026-09-07.md). Every
-- existing row defaults to 'pending' — the honest state: none of the
-- seeded charities has consented. ENFORCEMENT is gated behind the
-- CHARITY_CONSENT_POSTURE env ('open' = today's behaviour, no gate;
-- 'consent-first' = pledges blocked while any of a favpoll's charities
-- is unapproved), so applying this changes nothing until the posture
-- flips — the legal opinion sets the default.
-- Applied to STAGING and PRODUCTION by hand via the dashboard SQL
-- editor (house practice; the MCP OAuth client is broken).
alter table charities
  add column if not exists consent_status text not null default 'pending'
    check (consent_status in ('pending','approved','declined'));
alter table charities
  add column if not exists consent_contacted_at timestamptz;
alter table charities
  add column if not exists consent_decided_at timestamptz;

comment on column charities.consent_status is
  'Has the charity agreed to appear and receive pledges? Enforcement rides the CHARITY_CONSENT_POSTURE env.';
