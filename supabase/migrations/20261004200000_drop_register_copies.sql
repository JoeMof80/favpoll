-- THE ACCOUNT IS AN ACCOUNT AGAIN (step 5 of
-- references/charity-profiles-2026-09-27.md: "drop the register copies
-- from `charities` once nothing reads them").
--
-- Two sets of columns go, for two reasons.
--
-- THE REGISTER'S OWN WORDS were copied onto the account because the
-- account was once the only table there was: contact, activities,
-- classification, objects, areas, and the grant-making flag. They are the
-- mirror's, and step 4 pointed every reader at the mirror — measured
-- first, over the 54 active accounts: the mirror had activities for all
-- 54 where the copies had 53, nothing lost its email, website, objects or
-- areas, and the eleven rows that differed differed by a character or
-- four of whitespace.
--
-- THE SUGGESTIONS were never the account's either: a derivation is not an
-- agreement. Step 2 carried them to `charity_profiles` (62 accounts, zero
-- mismatches across all five fields) and left these columns unread.
--
-- What stays is what the account AGREED to: consent, money, the shelf, the
-- logo, the display name, the confirmed cause family, the confirmed
-- perfect topic and subset.
--
-- Copying and dropping in one migration would have made a rollback a data
-- loss. This is the drop, three steps later, and `charities` is now linked
-- to the register by its NUMBER alone.

-- The suggested-pair trigger goes with the columns it guards — but the
-- invariant does NOT: a suggested subset must belong to its suggested
-- topic wherever it is stored, and since step 2 that is the profile. The
-- same check moves there, which it should have done then.
drop trigger if exists charities_perfect_subset_suggested_check on charities;
drop function if exists charity_perfect_subset_suggested_check();

create or replace function charity_profile_subset_suggested_check()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if not subset_belongs_to_topic(
    new.perfect_subset_suggested_id, new.perfect_topic_suggested_id
  ) then
    raise exception
      'suggested subset % does not belong to suggested topic %',
      new.perfect_subset_suggested_id, new.perfect_topic_suggested_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger charity_profiles_subset_suggested_check
  before insert or update of
    perfect_topic_suggested_id, perfect_subset_suggested_id
  on charity_profiles
  for each row
  execute function charity_profile_subset_suggested_check();

comment on function charity_profile_subset_suggested_check is
  'A suggested subset must belong to its suggested topic. Moved from charities with the columns in step 5; the confirmed pair keeps its own check on the account.';

-- The register's words.
alter table charities
  drop column if exists registered_email,
  drop column if exists registered_website,
  drop column if exists activities,
  drop column if exists classification,
  drop column if exists objects,
  drop column if exists areas,
  drop column if exists grant_making;

-- The suggestions.
alter table charities
  drop column if exists perfect_topic_suggested_id,
  drop column if exists perfect_subset_suggested_id,
  drop column if exists perfect_topic_reason,
  drop column if exists cause_family_suggested,
  drop column if exists signature_events,
  drop column if exists website_read_at;

comment on table charities is
  'The charity ACCOUNT: what a charity has agreed to. Consent, money, the shelf, the logo, the display name, the confirmed cause family and perfect topic. The register''s own words live in register_charities and everything derived in charity_profiles, both keyed by the registered number — which is now the only link between them.';
