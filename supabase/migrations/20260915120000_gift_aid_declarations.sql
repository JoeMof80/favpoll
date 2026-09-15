-- Gift Aid declarations (founder go, 2026-09-15). Option 4 of the Gift
-- Aid routes: favpoll CAPTURES the declaration at pledge; the CHARITY
-- claims from HMRC itself (favpoll is not a Gift Aid agent and takes no
-- cut of the uplift). One declaration per pledge, on the PLEDGE amount
-- only — the tip is favpoll's and is never Gift-Aidable.
--
-- Fields are exactly what HMRC's claim schedule needs (first name,
-- last name, house name or number, postcode) — nothing more; the
-- pledge flow stays email-only unless the guest opts in.
--
-- CARD PLEDGES ONLY (v1): shared-pot allocations are excluded — the
-- allocation isn't the participant's own gift (the pot topper-upper
-- made the gift), so a declaration there wouldn't be honest. Pot
-- top-up Gift Aid is a possible follow-up, with counsel.
--
-- Whether the reveal mechanic voids Gift Aid (donor-benefit rules) is
-- on the counsel question list; founder's read (2026-09-15) is that a
-- sentence of sentiment has no market value. Capture is regret-free
-- either way — claims can't be made retroactively on pledges where
-- the declaration was never asked for.
--
-- Applied to STAGING and PRODUCTION by hand via the dashboard SQL
-- editor (house practice; the MCP OAuth client is broken).
create table if not exists gift_aid_declarations (
  id uuid primary key default gen_random_uuid(),
  pledge_id uuid not null unique references pledges(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  house_name_or_number text not null,
  postcode text not null,
  created_at timestamptz not null default now()
);

-- House pattern: no user-facing reads — RLS enabled with no policies;
-- all access goes through the service role (server actions / admin).
alter table gift_aid_declarations enable row level security;

comment on table gift_aid_declarations is
  'HMRC Gift Aid declaration captured at pledge (pledge amount only, never the tip). The charity claims; favpoll only holds the record.';
