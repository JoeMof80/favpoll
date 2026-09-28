-- SUBSETS, step 3: a subset's OWN record (favpoll-topic-rules §1, ruling 4
-- as revised by the founder, 2026-09-28). A pick says only "this beats
-- everything on the list I was shown", so:
--   * the favourite row's all-time totals stay the WHOLE-LIST record —
--     picks from favpolls whose poll carries no subset;
--   * picks from a subset's favpolls go to scoped totals, subset × favourite;
--   * a subset's full standing = its scoped total + the parent's
--     whole-list total for the same member (down, never up) — summed at
--     read time, never stored twice.

CREATE TABLE IF NOT EXISTS topic_subset_totals (
  subset_id         uuid NOT NULL REFERENCES topic_subsets(id) ON DELETE CASCADE,
  favourite_id      uuid NOT NULL REFERENCES favourites(id) ON DELETE CASCADE,
  all_time_pledged  numeric NOT NULL DEFAULT 0,
  all_time_count    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (subset_id, favourite_id)
);
CREATE INDEX IF NOT EXISTS topic_subset_totals_favourite
  ON topic_subset_totals (favourite_id);
ALTER TABLE topic_subset_totals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read topic subset totals" ON topic_subset_totals;
CREATE POLICY "Anyone can read topic subset totals"
  ON topic_subset_totals FOR SELECT TO public USING (true);

-- The one trigger that maintains the record, now routing by the poll's
-- subset. Same shape as before (recompute from allocations; withdrawn
-- pledges and exemplar favpolls excluded) with `fp.subset_id IS NULL`
-- on the favourite row's totals, and a scoped recompute for the subset
-- this allocation's poll carries, if any.
CREATE OR REPLACE FUNCTION public.update_favourite_totals()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  v_fav uuid := coalesce(new.favourite_id, old.favourite_id);
  v_subset uuid;
BEGIN
  UPDATE favourites
  SET
    all_time_pledged = (
      SELECT coalesce(sum(pa.amount), 0)
      FROM pledge_allocations pa
      JOIN pledges p ON p.id = pa.pledge_id
      JOIN favpoll_polls fp ON fp.id = p.favpoll_poll_id
      JOIN favpolls f ON f.id = fp.favpoll_id
      WHERE pa.favourite_id = v_fav
        AND p.withdrawn_at IS NULL
        AND f.is_exemplar IS NOT TRUE
        AND fp.subset_id IS NULL
    ),
    all_time_count = (
      SELECT count(*)
      FROM pledge_allocations pa
      JOIN pledges p ON p.id = pa.pledge_id
      JOIN favpoll_polls fp ON fp.id = p.favpoll_poll_id
      JOIN favpolls f ON f.id = fp.favpoll_id
      WHERE pa.favourite_id = v_fav
        AND p.withdrawn_at IS NULL
        AND f.is_exemplar IS NOT TRUE
        AND fp.subset_id IS NULL
    )
  WHERE id = v_fav;

  SELECT fp.subset_id INTO v_subset
  FROM pledges p
  JOIN favpoll_polls fp ON fp.id = p.favpoll_poll_id
  WHERE p.id = coalesce(new.pledge_id, old.pledge_id);

  IF v_subset IS NOT NULL THEN
    INSERT INTO topic_subset_totals (subset_id, favourite_id, all_time_pledged, all_time_count)
    SELECT
      v_subset,
      v_fav,
      coalesce(sum(pa.amount), 0),
      count(*)
    FROM pledge_allocations pa
    JOIN pledges p ON p.id = pa.pledge_id
    JOIN favpoll_polls fp ON fp.id = p.favpoll_poll_id
    JOIN favpolls f ON f.id = fp.favpoll_id
    WHERE pa.favourite_id = v_fav
      AND p.withdrawn_at IS NULL
      AND f.is_exemplar IS NOT TRUE
      AND fp.subset_id = v_subset
    ON CONFLICT (subset_id, favourite_id) DO UPDATE
      SET all_time_pledged = EXCLUDED.all_time_pledged,
          all_time_count = EXCLUDED.all_time_count;
  END IF;

  RETURN new;
END;
$function$;
