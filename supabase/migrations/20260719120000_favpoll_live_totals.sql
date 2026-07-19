-- Live raised totals for a set of favpolls. favpolls.total_raised is a
-- settlement figure — written once, at close, by the close cron — so it is
-- zero for a favpoll's entire live life. The poll page already computes the
-- live total per-poll by summing non-withdrawn pledges; this function does
-- the same for card lists (the /favpolls grid, the landing carousel and the
-- hero's open-favpolls stat) in one round trip.
-- Service-role only; execute revoked from client roles.
create or replace function favpoll_live_totals(p_favpoll_ids uuid[])
returns table (favpoll_id uuid, raised numeric)
language sql
stable
as $$
  select
    fp.favpoll_id,
    coalesce(sum(pl.total_amount), 0) as raised
  from favpoll_polls fp
  join pledges pl on pl.favpoll_poll_id = fp.id and pl.withdrawn_at is null
  where fp.favpoll_id = any(p_favpoll_ids)

  
  group by fp.favpoll_id;
$$;

revoke execute on function favpoll_live_totals(uuid[]) from public, anon, authenticated;
