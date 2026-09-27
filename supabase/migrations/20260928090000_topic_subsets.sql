-- SUBSETS (favpoll-topic-rules §1; founder's rulings, 2026-09-27 evening):
-- a named subset of ONE topic's items, for a cause or an occasion that
-- pulls for it. "Farm animal" is a subset of Animal. Its own object,
-- shared by everyone who points at it; admin-made; it has no items, no
-- copy and no rules of its own — the parent's openness and record apply.
-- Step 1 of the build order: the schema. Nothing reads these yet; the
-- per-charity `perfect_topic_items` list stands until step 4.

CREATE TABLE IF NOT EXISTS topic_subsets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  -- Topic grammar: singular, basic level, reads after "Favourite".
  title       text NOT NULL,
  -- Delisted from the picker (never deleted: favpolls point at it).
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (topic_id, title)
);
CREATE INDEX IF NOT EXISTS topic_subsets_topic ON topic_subsets (topic_id);

-- Membership is a join to the parent's own favourites, so a subset can
-- never name an item the parent lacks (ruling 6).
CREATE TABLE IF NOT EXISTS topic_subset_items (
  subset_id     uuid NOT NULL REFERENCES topic_subsets(id) ON DELETE CASCADE,
  favourite_id  uuid NOT NULL REFERENCES favourites(id) ON DELETE CASCADE,
  PRIMARY KEY (subset_id, favourite_id)
);
CREATE INDEX IF NOT EXISTS topic_subset_items_favourite
  ON topic_subset_items (favourite_id);

CREATE OR REPLACE FUNCTION topic_subset_item_belongs_to_parent()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  parent uuid;
  item_topic uuid;
BEGIN
  SELECT topic_id INTO parent FROM topic_subsets WHERE id = NEW.subset_id;
  SELECT topic_id INTO item_topic FROM favourites WHERE id = NEW.favourite_id;
  IF parent IS NULL OR item_topic IS DISTINCT FROM parent THEN
    RAISE EXCEPTION 'subset item % is not on the parent topic''s list', NEW.favourite_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS topic_subset_items_parent_check ON topic_subset_items;
CREATE TRIGGER topic_subset_items_parent_check
  BEFORE INSERT OR UPDATE ON topic_subset_items
  FOR EACH ROW EXECUTE FUNCTION topic_subset_item_belongs_to_parent();

-- Parent-plus-pointer (ruling 6): the topic stays the topic, the subset
-- sits beside it and must belong to it. One check function serves both
-- pointers.
CREATE OR REPLACE FUNCTION subset_belongs_to_topic(subset uuid, topic uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT subset IS NULL
      OR EXISTS (SELECT 1 FROM topic_subsets s WHERE s.id = subset AND s.topic_id = topic);
$$;

-- A favpoll's poll: the parent as topic_id, the subset beside it. The
-- card, hero, share text and live display say the subset's name; only
-- the record shows the parent (ruling 4).
ALTER TABLE favpoll_polls
  ADD COLUMN IF NOT EXISTS subset_id uuid REFERENCES topic_subsets(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS favpoll_polls_subset
  ON favpoll_polls (subset_id) WHERE subset_id IS NOT NULL;

CREATE OR REPLACE FUNCTION favpoll_poll_subset_check()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT subset_belongs_to_topic(NEW.subset_id, NEW.topic_id) THEN
    RAISE EXCEPTION 'subset % does not belong to topic %', NEW.subset_id, NEW.topic_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS favpoll_polls_subset_check ON favpoll_polls;
CREATE TRIGGER favpoll_polls_subset_check
  BEFORE INSERT OR UPDATE OF subset_id, topic_id ON favpoll_polls
  FOR EACH ROW EXECUTE FUNCTION favpoll_poll_subset_check();

-- A charity's perfect topic may be a subset (ruling 1: the charity is
-- not special — its perfect topic simply points at a subset of the
-- topic it already names). `perfect_topic_items` retires in step 4.
ALTER TABLE charities
  ADD COLUMN IF NOT EXISTS perfect_subset_id uuid REFERENCES topic_subsets(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS charities_perfect_subset
  ON charities (perfect_subset_id) WHERE perfect_subset_id IS NOT NULL;

CREATE OR REPLACE FUNCTION charity_perfect_subset_check()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT subset_belongs_to_topic(NEW.perfect_subset_id, NEW.perfect_topic_id) THEN
    RAISE EXCEPTION 'perfect subset % does not belong to perfect topic %',
      NEW.perfect_subset_id, NEW.perfect_topic_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS charities_perfect_subset_check ON charities;
CREATE TRIGGER charities_perfect_subset_check
  BEFORE INSERT OR UPDATE OF perfect_subset_id, perfect_topic_id ON charities
  FOR EACH ROW EXECUTE FUNCTION charity_perfect_subset_check();

-- Catalogue data, readable like topics; written only by the service
-- role (admin), as topics are.
ALTER TABLE topic_subsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_subset_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read topic subsets" ON topic_subsets;
CREATE POLICY "Anyone can read topic subsets"
  ON topic_subsets FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Anyone can read topic subset items" ON topic_subset_items;
CREATE POLICY "Anyone can read topic subset items"
  ON topic_subset_items FOR SELECT TO public USING (true);
