-- PR-1: replace events.occasion with register + occasion_type
-- register: 5-value enum driving tense, closing defaults, headline fallback
-- occasion_type: optional free text (e.g. "Birthday", "Memorial")

-- 1. Add new columns
ALTER TABLE events
  ADD COLUMN register text,
  ADD COLUMN occasion_type text;

-- 2. Backfill register from occasion
UPDATE events SET register = CASE occasion
  WHEN 'memorial'    THEN 'remembering'
  WHEN 'tribute'     THEN 'remembering'
  WHEN 'birthday'    THEN 'celebrating_one'
  WHEN 'retirement'  THEN 'celebrating_one'
  WHEN 'leaving'     THEN 'celebrating_one'
  WHEN 'graduation'  THEN 'celebrating_one'
  WHEN 'christening' THEN 'celebrating_one'
  WHEN 'achievement' THEN 'celebrating_one'
  WHEN 'recovery'    THEN 'celebrating_one'
  WHEN 'award'       THEN 'celebrating_one'
  WHEN 'promotion'   THEN 'celebrating_one'
  WHEN 'wedding'     THEN 'celebrating_many'
  WHEN 'engagement'  THEN 'celebrating_many'
  WHEN 'anniversary' THEN 'celebrating_many'
  ELSE 'neutral'
END;

-- 3. Backfill occasion_type from occasion (known types only; celebration/other → null)
UPDATE events SET occasion_type = CASE occasion
  WHEN 'memorial'    THEN 'Memorial'
  WHEN 'tribute'     THEN 'Tribute'
  WHEN 'birthday'    THEN 'Birthday'
  WHEN 'retirement'  THEN 'Retirement'
  WHEN 'leaving'     THEN 'Leaving do'
  WHEN 'graduation'  THEN 'Graduation'
  WHEN 'christening' THEN 'Christening'
  WHEN 'achievement' THEN 'Achievement'
  WHEN 'recovery'    THEN 'Recovery'
  WHEN 'award'       THEN 'Award'
  WHEN 'promotion'   THEN 'Promotion'
  WHEN 'wedding'     THEN 'Wedding'
  WHEN 'engagement'  THEN 'Engagement'
  WHEN 'anniversary' THEN 'Anniversary'
  ELSE NULL
END;

-- 4. Lock down: register is mandatory, add check constraint
ALTER TABLE events
  ALTER COLUMN register SET NOT NULL;

ALTER TABLE events
  ADD CONSTRAINT events_register_check
    CHECK (register IN ('remembering','celebrating_one','celebrating_many','cause','neutral'));

-- 5. Drop the old column
ALTER TABLE events DROP COLUMN occasion;
