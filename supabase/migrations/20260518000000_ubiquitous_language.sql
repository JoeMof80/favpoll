-- Ubiquitous Language Audit — 2026-05-18
-- Apply these four migrations to complete the schema rename.
-- Run via: Supabase Dashboard > SQL Editor, or via supabase CLI with a PAT.

-- Migration 1 — Rename persons to protagonists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'persons') THEN
    ALTER TABLE persons RENAME TO protagonists;
    RAISE NOTICE 'Renamed persons to protagonists';
  ELSE
    RAISE NOTICE 'persons table does not exist (already renamed)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'person_id') THEN
    ALTER TABLE events RENAME COLUMN person_id TO protagonist_id;
    RAISE NOTICE 'Renamed events.person_id to protagonist_id';
  ELSE
    RAISE NOTICE 'events.person_id does not exist (already renamed)';
  END IF;

  ALTER TABLE events DROP CONSTRAINT IF EXISTS events_person_id_fkey;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND constraint_name = 'events_protagonist_id_fkey'
  ) THEN
    ALTER TABLE events ADD CONSTRAINT events_protagonist_id_fkey
      FOREIGN KEY (protagonist_id) REFERENCES protagonists(id);
    RAISE NOTICE 'Added events_protagonist_id_fkey constraint';
  ELSE
    RAISE NOTICE 'events_protagonist_id_fkey already exists';
  END IF;
END $$;

-- Migration 2 — Rename personal_quote to personal_reveal
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'event_polls' AND column_name = 'personal_quote') THEN
    ALTER TABLE event_polls RENAME COLUMN personal_quote TO personal_reveal;
    RAISE NOTICE 'Renamed event_polls.personal_quote to personal_reveal';
  ELSE
    RAISE NOTICE 'event_polls.personal_quote does not exist (already renamed)';
  END IF;
END $$;

-- Migration 3 — Rename is_master to is_canonical
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'topic_items' AND column_name = 'is_master') THEN
    ALTER TABLE topic_items RENAME COLUMN is_master TO is_canonical;
    RAISE NOTICE 'Renamed topic_items.is_master to is_canonical';
  ELSE
    RAISE NOTICE 'topic_items.is_master does not exist (already renamed)';
  END IF;
END $$;

-- Migration 4 — Rename graduate_topic_items function
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'graduate_topic_items'
  ) THEN
    ALTER FUNCTION graduate_topic_items() RENAME TO include_topic_items;
    RAISE NOTICE 'Renamed graduate_topic_items to include_topic_items';
  ELSE
    RAISE NOTICE 'graduate_topic_items function does not exist (already renamed)';
  END IF;
END $$;
