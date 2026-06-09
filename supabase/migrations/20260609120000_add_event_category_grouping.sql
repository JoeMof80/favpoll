ALTER TABLE events
  ADD COLUMN IF NOT EXISTS event_category text
    CHECK (event_category IN ('celebration','memorial','fundraiser')),
  ADD COLUMN IF NOT EXISTS event_grouping text NOT NULL DEFAULT 'individual'
    CHECK (event_grouping IN ('individual','couple','group'));

-- Backfill event_category from occasion_type
UPDATE events SET event_category =
  CASE
    WHEN occasion_type IN (
      'Remembrance','Memorial','Celebration of life','Tribute','Pet memorial'
    ) THEN 'memorial'
    WHEN occasion_type IN (
      'Fundraiser','Sponsored event','Charity night','In memoriam appeal'
    ) THEN 'fundraiser'
    WHEN occasion_type IS NOT NULL THEN 'celebration'
    ELSE NULL
  END
WHERE event_category IS NULL;

-- Backfill event_grouping from is_plural
UPDATE events SET event_grouping =
  CASE WHEN is_plural = true THEN 'couple' ELSE 'individual' END
WHERE event_grouping = 'individual';
