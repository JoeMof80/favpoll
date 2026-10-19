-- Two trigram GIN indexes on the wide register table, 46 MB each, built
-- for the search approach rejected on 2026-09-27 (#941): search_register
-- and count_register read the narrow materialised view
-- register_search_rows, which carries its own trigram index.
-- pg_stat_user_indexes on prod showed 0 and 5 scans since May.
--
-- Dropped 2026-10-19 to bring the free-plan database back towards 500 MB
-- (prod 604 MB → 512 MB). APPLIED BY HAND on prod and staging the same
-- day, via the Supabase MCP apply_migration — this file records it.
DROP INDEX IF EXISTS register_charities_name_trgm;
DROP INDEX IF EXISTS register_charities_name_key_trgm;
