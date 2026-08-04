-- Supabase security advisor (email 2026-08-03, fixed 2026-08-05): these
-- two tables were created without RLS, leaving them readable AND
-- writable via the anon key through PostgREST. Both are service-role
-- surfaces (the service role bypasses RLS), so enabling RLS with no
-- policies — the house pattern — closes the anon door with zero app
-- impact. Applied to staging and production via MCP on 2026-08-05.
alter table public.disbursements enable row level security;
alter table public.rate_limits enable row level security;
