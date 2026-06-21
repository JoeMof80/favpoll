Check for pending database migrations and apply them to the Supabase database.

## What to do

1. Read `types/index.ts` to understand the current TypeScript schema (source of truth for intended shape).
2. Check recent git history (`git log --oneline -20`) and any `.sql` migration files in the project for context on what has already been applied.
3. Compare against known applied migrations by looking at what columns/tables are referenced in the codebase but may not exist yet in the DB.
4. For any column that appears to be missing, generate the appropriate SQL using the safe pattern:

```sql
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TYPE DEFAULT value;
```

5. Present the SQL to the user and ask them to run it in the Supabase SQL editor (do not run it automatically).
6. After the user confirms it ran, verify by checking that the relevant queries in the app no longer produce errors.

## Common migrations in this project

These have already been applied — do not re-suggest them:

- `event_poll_items.is_hidden BOOLEAN DEFAULT FALSE`
- `persons.date_label TEXT DEFAULT NULL`
- `events.occasion_label TEXT DEFAULT NULL`
- `events.market TEXT NOT NULL DEFAULT 'en-GB'`
- `topics.is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `topics.placeholders JSONB DEFAULT '{}'`
- `topic_items.markets TEXT[] NOT NULL DEFAULT ARRAY['en-GB']`
- `topic_items.review_status TEXT DEFAULT NULL` — values: `pending_review`, `accepted`, `rejected`
- `events_occasion_check` constraint updated to include: `memorial, tribute, birthday, retirement, wedding, engagement, anniversary, leaving, graduation, christening, achievement, recovery, award, promotion, celebration, other`

## Notes

- The Supabase project uses `@supabase/ssr` — the admin client uses `SUPABASE_SERVICE_ROLE_KEY`.
- Always use `ADD COLUMN IF NOT EXISTS` to make migrations safe to re-run.
- If a new table is needed, include a `CREATE TABLE IF NOT EXISTS` with full column definitions.
