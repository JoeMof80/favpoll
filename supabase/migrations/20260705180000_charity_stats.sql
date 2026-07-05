-- Per-charity totals for the public charity page. A charity's share of a
-- favpoll is the favpoll's non-withdrawn pledge total split equally across
-- its charities (proceeds split equally — the product rule). Live + closed.
-- Service-role only; execute revoked from client roles.
create or replace function charity_stats(p_charity_id uuid)
returns json
language sql
stable
as $$
  with favpoll_totals as (
    select
      fp.favpoll_id,
      coalesce(sum(pl.total_amount), 0) as raised
    from favpoll_polls fp
    join pledges pl on pl.favpoll_poll_id = fp.id and pl.withdrawn_at is null
    group by fp.favpoll_id
  ),
  charity_counts as (
    select favpoll_id, count(*) as n
    from favpoll_charities
    group by favpoll_id
  )
  select json_build_object(
    'total_raised', coalesce(sum(
      case when cc.n > 0 then ft.raised / cc.n else 0 end
    ), 0),
    'favpoll_count', count(distinct fc.favpoll_id),
    'live_count', count(distinct fc.favpoll_id) filter (
      where f.closed_at is null
        and f.is_listed = true
        and f.is_private = false
    )
  )
  from favpoll_charities fc
  join favpolls f on f.id = fc.favpoll_id
  left join favpoll_totals ft on ft.favpoll_id = fc.favpoll_id
  left join charity_counts cc on cc.favpoll_id = fc.favpoll_id
  where fc.charity_id = p_charity_id;
$$;

revoke execute on function charity_stats(uuid) from public, anon, authenticated;
