-- SUBSETS, step 4: a charity's perfect topic may be a SUBSET (favpoll-
-- topic-rules §1, ruling 1: the charity is not special — its perfect
-- topic simply points at a subset of the topic it names). The suggester
-- names an existing approved subset; the admin confirms it beside the
-- topic. Same suggested/confirmed split as the topic itself
-- (perfect_topic_suggested_id / perfect_topic_id; perfect_subset_id from
-- 20260928090000). The per-charity `perfect_topic_items` list is no
-- longer written; it is dropped once nothing reads it.
ALTER TABLE charities
  ADD COLUMN IF NOT EXISTS perfect_subset_suggested_id uuid
    REFERENCES topic_subsets(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION charity_perfect_subset_suggested_check()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT subset_belongs_to_topic(NEW.perfect_subset_suggested_id, NEW.perfect_topic_suggested_id) THEN
    RAISE EXCEPTION 'suggested subset % does not belong to suggested topic %',
      NEW.perfect_subset_suggested_id, NEW.perfect_topic_suggested_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS charities_perfect_subset_suggested_check ON charities;
CREATE TRIGGER charities_perfect_subset_suggested_check
  BEFORE INSERT OR UPDATE OF perfect_subset_suggested_id, perfect_topic_suggested_id ON charities
  FOR EACH ROW EXECUTE FUNCTION charity_perfect_subset_suggested_check();
