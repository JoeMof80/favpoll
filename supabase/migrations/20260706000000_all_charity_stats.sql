-- Batch per-charity totals for the public charities index (avoids an N+1
-- of charity_stats() per row). Same equal-split rule as charity_stats.
-- Service-role only.
create or replace function all_charity_stats()
returns json
language sql
stable
as $$
  with favpoll_totals as (
    select fp.favpoll_id, coalesce(sum(pl.total_amount), 0) as raised
    from favpoll_polls fp
    join pledges pl on pl.favpoll_poll_id = fp.id and pl.withdrawn_at is null
    group by fp.favpoll_id
  ),
  charity_counts as (
    select favpoll_id, count(*) as n from favpoll_charities group by favpoll_id
  ),
  per_charity as (
    select
      fc.charity_id,
      coalesce(sum(case when cc.n > 0 then ft.raised / cc.n else 0 end), 0) as total_raised,
      count(distinct fc.favpoll_id) filter (
        where f.closed_at is null and f.is_listed = true and f.is_private = false
      ) as live_count
    from favpoll_charities fc
    join favpolls f on f.id = fc.favpoll_id
    left join favpoll_totals ft on ft.favpoll_id = fc.favpoll_id
    left join charity_counts cc on cc.favpoll_id = fc.favpoll_id
    group by fc.charity_id
  )
  select coalesce(json_object_agg(
    charity_id,
    json_build_object('total_raised', total_raised, 'live_count', live_count)
  ), '{}'::json)
  from per_charity;
$$;

revoke execute on function all_charity_stats() from public, anon, authenticated;
