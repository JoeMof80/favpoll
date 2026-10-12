-- The destructive half of 20261012120000_invite_drafted_at.sql.
--
-- Safe only once the build that reads `invite_drafted_at` is SERVING in
-- production — the same ordering gate the 13-column drop used. That build
-- is PR #1024, merged and deployed 2026-10-12.
--
-- The column is entirely NULL: its only two values were stamps from the
-- night the Draft-invite button shipped, and they were cleared the same
-- day along with six approvals for charities nobody had asked.
alter table charities drop column if exists consent_contacted_at;
