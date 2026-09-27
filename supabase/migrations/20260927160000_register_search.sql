-- Search over the register mirror (founder, 2026-09-27: search and
-- verification move off the Commission's API).
--
-- Substring on a punctuation-stripped NAME KEY, never the trigram
-- similarity operator: on 358k names `%` pulls ~50k index candidates and
-- rechecks 22k heap blocks (17s cold on staging), while an indexed LIKE
-- on the key answers in under 100ms and finds "ST LUKE'S" for "st lukes"
-- — 98 rows where the raw name found 26. Typos fall through to the
-- Commission's API in the caller. Registered main charities only, ranked
-- whole name > prefix > word start > anywhere, income as the tie-break
-- so the famous one of many St Luke's comes first. `place` filters on
-- the registered address, for "st lukes winsford" (founder, 2026-09-09).

-- Lower-case, letters digits and spaces only, single-spaced.
CREATE OR REPLACE FUNCTION register_name_key(s text)
RETURNS text
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
AS $$
  SELECT btrim(regexp_replace(regexp_replace(lower(s), '[^a-z0-9 ]', '', 'g'), ' +', ' ', 'g'));
$$;

ALTER TABLE register_charities
  ADD COLUMN IF NOT EXISTS name_key text
  GENERATED ALWAYS AS (register_name_key(name)) STORED;

CREATE INDEX IF NOT EXISTS register_charities_name_key_trgm
  ON register_charities USING gin (name_key gin_trgm_ops);

CREATE OR REPLACE FUNCTION search_register(
  q text,
  place text DEFAULT NULL,
  lim integer DEFAULT 20
)
RETURNS TABLE (
  registered_number integer,
  name text,
  latest_income bigint,
  address text,
  postcode text,
  website text,
  rank real
)
LANGUAGE sql STABLE
AS $$
  WITH k AS (SELECT register_name_key(q) AS key)
  SELECT
    r.registered_number,
    r.name,
    r.latest_income,
    r.address,
    r.postcode,
    r.website,
    (CASE
      WHEN r.name_key = k.key THEN 1.0
      WHEN r.name_key LIKE k.key || '%' THEN 0.9
      WHEN r.name_key LIKE '% ' || k.key || '%' THEN 0.7
      ELSE 0.5
    END)::real AS rank
  FROM register_charities r, k
  WHERE k.key <> ''
    AND r.status = 'Registered'
    AND r.name_key LIKE '%' || k.key || '%'
    AND (
      place IS NULL
      OR r.address ILIKE '%' || place || '%'
      OR r.postcode ILIKE place || '%'
    )
  ORDER BY rank DESC, r.latest_income DESC NULLS LAST, r.name
  LIMIT lim;
$$;

-- How many registered charities match, before the cap (the picker's
-- "N matches — keep typing" hint).
CREATE OR REPLACE FUNCTION count_register(q text)
RETURNS integer
LANGUAGE sql STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM register_charities r
  WHERE register_name_key(q) <> ''
    AND r.status = 'Registered'
    AND r.name_key LIKE '%' || register_name_key(q) || '%';
$$;
