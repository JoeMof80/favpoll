-- The register search runs over a NARROW copy of the registered
-- charities (2026-09-27, after timing on staging): `register_charities`
-- is a 355 MB heap — objects, activities, classification inline — so a
-- common word ("trust", "the": 51k matches) fetched 28k pages and hit
-- the statement timeout even from the name-key index. The registered
-- rows' searchable columns are 24 MB: this view holds them, fits in
-- shared buffers and stays hot. Refreshed by the loader
-- (scripts/register/load-register.ts) after every extract.

CREATE MATERIALIZED VIEW IF NOT EXISTS register_search_rows AS
  SELECT registered_number, name, name_key, latest_income, address, postcode, website
  FROM register_charities
  WHERE status = 'Registered'
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS register_search_rows_pk
  ON register_search_rows (registered_number);
CREATE INDEX IF NOT EXISTS register_search_rows_name_key_trgm
  ON register_search_rows USING gin (name_key gin_trgm_ops);

-- Concurrent, so a refresh never blocks a search (needs the unique index).
CREATE OR REPLACE FUNCTION refresh_register_search()
RETURNS void
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY register_search_rows;
$$;
REVOKE ALL ON FUNCTION refresh_register_search() FROM PUBLIC, anon, authenticated;

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
  FROM register_search_rows r, k
  WHERE k.key <> ''
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
-- "N matches — keep typing" hint). Counted up to 1000 and no further: a
-- word like "trust" has tens of thousands, and "1000+" says keep typing
-- as well as the true number would.
CREATE OR REPLACE FUNCTION count_register(q text)
RETURNS integer
LANGUAGE sql STABLE
AS $$
  SELECT COUNT(*)::integer FROM (
    SELECT 1
    FROM register_search_rows r
    WHERE register_name_key(q) <> ''
      AND r.name_key LIKE '%' || register_name_key(q) || '%'
    LIMIT 1000
  ) capped;
$$;
