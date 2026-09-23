-- The cause FAMILY — the key §2 of references/favpoll-pairing-table needs
-- (2026-09-24). A charity's family is what gives a favpoll its
-- charity→topic and occasion↔charity edges; the generator will read it to
-- write those edges into the Story.
--
-- Two columns, on purpose:
--   cause_family_suggested  the model's guess from the register's
--                           `activities` text (web app, at insert / backfill)
--   cause_family            CONFIRMED by an admin in the outreach queue —
--                           the ONLY one the generator may ever read.
-- A wrong family is a wrong edge ("Marie Curie cares for dogs"), so an
-- unconfirmed guess stays inert. NULL = no cause of its own (grant-makers,
-- "General Charitable Purposes") — that is a valid, honest answer.

alter table charities
  add column if not exists cause_family text
    check (cause_family in (
      'animals','children','older_people','end_of_life','health_condition',
      'mental_health','homelessness','food_poverty','environment_heritage',
      'sea_rescue','international','entertainment'
    )),
  add column if not exists cause_family_suggested text
    check (cause_family_suggested in (
      'animals','children','older_people','end_of_life','health_condition',
      'mental_health','homelessness','food_poverty','environment_heritage',
      'sea_rescue','international','entertainment'
    ));

comment on column charities.cause_family is
  'Admin-confirmed cause family (references/favpoll-pairing-table §2). The generator reads ONLY this. NULL = no cause of its own.';
comment on column charities.cause_family_suggested is
  'Model suggestion from the register''s activities text. Shown to the admin; never read by the generator.';
