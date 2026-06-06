-- PR-2: re-key topics.placeholders from old lowercase occasion strings to
-- the new title-cased occasion_type values introduced in PR-1.
--
-- Key mapping:
--   memorial    → Memorial
--   tribute     → Tribute
--   birthday    → Birthday
--   retirement  → Retirement
--   leaving     → Leaving do
--   graduation  → Graduation
--   christening → Christening
--   achievement → Achievement
--   recovery    → Recovery
--   award       → Award
--   promotion   → Promotion
--   wedding     → Wedding
--   engagement  → Engagement
--   anniversary → Anniversary
--   default     → default  (kept as-is — special fallback key)
--   celebration → dropped  (no matching occasion_type; generic content)
--   other       → dropped  (no matching occasion_type; generic content)

UPDATE topics
SET placeholders = (
  SELECT COALESCE(
    jsonb_object_agg(new_key, value) FILTER (WHERE new_key IS NOT NULL),
    '{}'::jsonb
  )
  FROM (
    SELECT
      CASE key
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
        WHEN 'default'     THEN 'default'
        -- 'celebration' and 'other' intentionally dropped
        ELSE NULL
      END AS new_key,
      value
    FROM jsonb_each(placeholders)
  ) remapped
)
WHERE placeholders IS NOT NULL;
