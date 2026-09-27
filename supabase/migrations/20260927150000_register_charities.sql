-- THE REGISTER MIRROR (founder, 2026-09-27): every charity on the Charity
-- Commission register, in our own database, refreshed from the
-- Commission's bulk extract. Knowledge, not a relationship: a row here is
-- never a consenting charity. The `charities` table stays the account
-- (consent, verification, Gift Aid, logo), linked by registered number.
-- Search and verification move here; enrichment (cause family, perfect
-- topic, lens, signature events) can run ahead of demand.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS register_charities (
  registered_number      integer PRIMARY KEY,   -- registered_charity_number, main charity only
  organisation_number    integer NOT NULL UNIQUE,
  name                   text NOT NULL,
  status                 text NOT NULL,          -- Registered | Removed
  charity_type           text,
  registered_on          date,
  removed_on             date,
  is_cio                 boolean,
  company_number         text,
  latest_income          bigint,
  latest_expenditure     bigint,
  financial_year_end     date,
  -- contact, as the register publishes it
  address                text,
  postcode               text,
  phone                  text,
  email                  text,
  website                text,
  -- purpose, the generator's signal
  activities             text,
  objects                text,
  area_of_benefit        text,
  classification         jsonb,                  -- {what: [], who: [], how: []}
  areas                  jsonb,                  -- [{type, description}]
  gift_aid               boolean,
  has_land               boolean,
  extract_date           date NOT NULL,
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- fuzzy name search, and the slices the pipeline works in
CREATE INDEX IF NOT EXISTS register_charities_name_trgm
  ON register_charities USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS register_charities_income
  ON register_charities (latest_income DESC NULLS LAST)
  WHERE status = 'Registered';
CREATE INDEX IF NOT EXISTS register_charities_status
  ON register_charities (status);

-- Service role only: the apps read it through server code.
ALTER TABLE register_charities ENABLE ROW LEVEL SECURITY;
