-- One-round-trip aggregates for the admin dashboard. Called by the admin
-- app with the service role only; execute revoked from client roles so
-- pledge/tip sums can never leak through anon RPC.
create or replace function admin_dashboard_stats()
returns json
language sql
stable
as $$
  select json_build_object(
    'favpolls_total', (select count(*) from favpolls),
    'favpolls_open', (select count(*) from favpolls where closed_at is null),
    'favpolls_closed', (select count(*) from favpolls where closed_at is not null),
    'pledges_count', (select count(*) from pledges where withdrawn_at is null),
    'total_pledged', coalesce((select sum(total_amount) from pledges where withdrawn_at is null), 0),
    'total_tips', coalesce((select sum(tip_amount) from pledges where withdrawn_at is null), 0),
    'pending_contributions', (select count(*) from favourites where review_status = 'pending_review' and source = 'guest'),
    'active_charities', (select count(*) from charities where is_active),
    'charity_issues', (select count(*) from charities where verification_status in ('not_found', 'removed', 'name_mismatch')),
    'drafts_to_review', (select count(*) from generated_drafts where status = 'generated')
  );
$$;

revoke execute on function admin_dashboard_stats() from public, anon, authenticated;
