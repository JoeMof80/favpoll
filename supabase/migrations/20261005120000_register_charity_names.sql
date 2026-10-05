-- THE REGISTER'S OTHER NAMES (founder, 2026-10-05: "we should use the
-- register names but I don't like that they are uppercase, and some are
-- verbose and not exactly the brand name").
--
-- The Commission publishes them: publicextract.charity_other_names holds
-- 175,009 rows for England and Wales — 98,691 WORKING names and 76,318
-- PREVIOUS names — and we were never loading it. So the brand name is on
-- the register after all: COMIC RELIEF against the legal CHARITY
-- PROJECTS, NSPCC against THE NATIONAL SOCIETY FOR THE PREVENTION OF
-- CRUELTY TO CHILDREN, RNLI, MIND, SHELTER, SAVE THE CHILDREN, DIABETES
-- UK, NATIONAL TRUST, RNIB, and "R S P C A" spaced out.
--
-- What this is FOR: verification. A charity's display name is ours — our
-- case, our apostrophes, our accents (the register holds MEDECINS SANS
-- FRONTIERES where we hold Médecins Sans Frontières) — but it must be
-- ACCOUNTABLE to the register: a name we show should be one the register
-- knows for that number. Matching against the legal name alone made 17
-- of 42 account charities read as a name mismatch and silently cost them
-- the verified tick on the public page.
--
-- A table rather than a column on register_charities: 175k rows, and
-- keyed by number it can also feed search by brand name later (the
-- picker's mirror search reads the legal name only today, so an organiser
-- typing "Comic Relief" falls through to the Commission's API).
--
-- Service-role only, like the rest of the mirror.
create table if not exists register_charity_names (
  registered_number integer not null,
  -- 'Working name' | 'Previous name', as the extract words it.
  name_type text not null,
  name text not null,
  -- Which extract carried it, so names the register has dropped can be
  -- cleared after a load instead of lingering for ever.
  extract_date date not null,
  primary key (registered_number, name_type, name)
);

create index if not exists register_charity_names_number
  on register_charity_names (registered_number);

alter table register_charity_names enable row level security;

comment on table register_charity_names is
  'The working and previous names the Charity Commission publishes per registered number (publicextract.charity_other_names). Read when verifying a charity''s name, so a brand name the register knows counts as its name.';
