-- Views read past row-level security unless they are told not to.
--
-- A view with no `security_invoker` runs as its OWNER, so it ignores RLS on
-- the tables beneath it. Three such views existed in `public`, all with the
-- default Supabase grants to `anon` and `authenticated`, and the public
-- browser key could read every one of them (verified against production on
-- 2026-10-20: `register_profile_floor` returned rows to the publishable key
-- while `register_charities` itself correctly returned none).
--
-- What leaked was public Charity Commission data plus `consent_status` and
-- `is_active` — no money, no personal data. The tables that hold those are
-- locked and stay locked: pledges, users, gift_aid_declarations and
-- charity_profiles all return nothing to the public key.
--
-- See references/audits/tech-debt-2026-10.md §1.1 and issue #1096.

-- ─── KEPT, AND MADE TO RESPECT RLS ─────────────────────────────────────────
-- refresh_charity_profiles() builds its `floor_now` temporary table from
-- this view, so it is load-bearing and must stay. `security_invoker` makes
-- it run as the caller: the service role (bypassrls) still reads everything,
-- and anon now meets register_charities' RLS, which has no policy, and gets
-- nothing.
alter view register_profile_floor set (security_invoker = on);

-- ─── DROPPED: DIAGNOSTICS NOTHING READS ────────────────────────────────────
-- Both were written as hand-debugging aids for the profile backfill and
-- neither is queried by any application code, SQL function or script — the
-- only mentions are prose comments in the migrations that created them
-- (20261004160000 and 20261004180000), where their definitions remain if
-- either is ever wanted back.
--
-- `charity_profiles_stale` named profiles whose fingerprints had drifted
-- from the mirror; `charity_profiles_unkeyable` named account charities
-- whose registered number is not a shape the profile key accepts. Both are
-- a SELECT away from being recreated, with `security_invoker = on` this
-- time.
drop view if exists charity_profiles_stale;
drop view if exists charity_profiles_unkeyable;

-- Note for whoever adds the next view: set `security_invoker = on` on it.
-- The broad `anon` grants come from Supabase's defaults on the public
-- schema and are harmless on a table whose RLS has no policy, but a view
-- without this setting turns them back into read access.
