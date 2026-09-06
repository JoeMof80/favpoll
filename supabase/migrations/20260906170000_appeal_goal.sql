-- Appeal-level goal (founder, 2026-09-06): the fundraising grammar
-- charities expect. Applied to STAGING by hand via the dashboard SQL
-- editor (MCP OAuth broken). Production: apply at the launch flip.
alter table appeals add column if not exists goal_amount numeric check (goal_amount > 0)
