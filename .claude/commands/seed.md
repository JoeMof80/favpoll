Run the FavPoll seed script to push any topic/placeholder/charity/category changes to the Supabase database.

1. Check whether `scripts/seed.ts` has been modified (via `git status` or `git diff`). If it has, briefly summarise what changed (new topics, updated placeholders, etc.).
2. Run `pnpm seed` and report the output.
3. If any inserts or updates are 0 when changes were expected, flag the likely cause (e.g. title mismatch, missing column).
