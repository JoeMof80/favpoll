-- 20260604120000_add_guest_pledge_columns.sql
--
-- Brings the `pledges` table in line with the documented canonical schema.
--
-- Context: guest_email, guest_token, withdrawn_at, and pot_allocation_id were
-- added to STAGING manually via the Supabase SQL editor and never captured in a
-- migration. PRODUCTION is therefore missing them, which would break guest
-- pledging, pledge withdrawal, and shared-fund-funded pledges the moment those
-- paths are exercised. This migration makes the change reproducible everywhere.
--
-- Written to be idempotent so it is a no-op on staging (where the columns
-- already exist) and a real change on production:
--   - ADD COLUMN IF NOT EXISTS for each column
--   - the identity constraint is dropped-if-present then re-added under a known
--     name, replacing any older "clerk_user_id required" rule
--
-- Note: pot_allocation_id is left as a bare uuid (no FK) to match the documented
-- schema. It logically references pot_allocations(id); add a FK in a later
-- migration if/when that relationship is enforced.

begin;

alter table pledges
  add column if not exists guest_email      text,
  add column if not exists guest_token      uuid,
  add column if not exists withdrawn_at     timestamptz,
  add column if not exists pot_allocation_id uuid;

-- Identity rule: a pledge must be attributable to either a signed-in user or a
-- guest email. Replaces any prior constraint that required clerk_user_id.
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'pledges_identity_check'
  ) then
    alter table pledges drop constraint pledges_identity_check;
  end if;

  alter table pledges
    add constraint pledges_identity_check
    check (clerk_user_id is not null or guest_email is not null);
end $$;

commit;
