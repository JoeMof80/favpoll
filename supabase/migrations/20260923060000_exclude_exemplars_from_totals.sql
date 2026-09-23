-- Exemplar favpolls are FICTION (seed-exemplars.ts, is_exemplar = true,
-- created_by = 'user_seed_exemplar'). They exist to show an organiser what a
-- favpoll looks like with results in it, so they carry pledges — and until
-- now those pledges counted everywhere real ones do.
--
-- Three surfaces were affected, all of them public:
--   charity_stats / all_charity_stats  — "Raised through favpoll" per charity
--   update_favourite_totals (trigger)  — favourites.all_time_pledged/_count,
--                                        which IS the permanent record
--
-- Nobody noticed because seed-exemplars.ts had been writing zero pledges
-- since the schema moved (fixed 2026-09-23). Repairing that script is what
-- made this reachable, so the exclusion lands with it.
--
-- `is not true` rather than `= false`: is_exemplar is nullable on older rows.

-- 1. Per-charity totals ------------------------------------------------------
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
  where fc.charity_id = p_charity_id
    and f.is_exemplar is not true;
$$;

revoke execute on function charity_stats(uuid) from public, anon, authenticated;

-- 2. Batch totals for the charities index ------------------------------------
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
    where f.is_exemplar is not true
    group by fc.charity_id
  )
  select coalesce(json_object_agg(
    charity_id,
    json_build_object('total_raised', total_raised, 'live_count', live_count)
  ), '{}'::json)
  from per_charity;
$$;

revoke execute on function all_charity_stats() from public, anon, authenticated;

-- 3. The permanent record ----------------------------------------------------
-- A fictional pick must not become part of the all-time ranking.
create or replace function public.update_favourite_totals()
returns trigger
language plpgsql
as $function$
begin
  update favourites
  set
    all_time_pledged = (
      select coalesce(sum(pa.amount), 0)
      from pledge_allocations pa
      join pledges p on p.id = pa.pledge_id
      join favpoll_polls fp on fp.id = p.favpoll_poll_id
      join favpolls f on f.id = fp.favpoll_id
      where pa.favourite_id = coalesce(new.favourite_id, old.favourite_id)
        and p.withdrawn_at is null
        and f.is_exemplar is not true
    ),
    all_time_count = (
      select count(*)
      from pledge_allocations pa
      join pledges p on p.id = pa.pledge_id
      join favpoll_polls fp on fp.id = p.favpoll_poll_id
      join favpolls f on f.id = fp.favpoll_id
      where pa.favourite_id = coalesce(new.favourite_id, old.favourite_id)
        and p.withdrawn_at is null
        and f.is_exemplar is not true
    )
  where id = coalesce(new.favourite_id, old.favourite_id);
  return new;
end;
$function$;

-- 4. Repair what the old definition already wrote -----------------------------
-- The trigger only fires per allocation, so existing all-time figures keep any
-- exemplar contamination until recomputed. Touches only rows that change.
with totals as (
  select
    pa.favourite_id,
    coalesce(sum(pa.amount), 0) as pledged,
    count(*) as cnt
  from pledge_allocations pa
  join pledges p on p.id = pa.pledge_id
  join favpoll_polls fp on fp.id = p.favpoll_poll_id
  join favpolls f on f.id = fp.favpoll_id
  where p.withdrawn_at is null
    and f.is_exemplar is not true
  group by pa.favourite_id
)
update favourites fv
set
  all_time_pledged = coalesce(t.pledged, 0),
  all_time_count = coalesce(t.cnt, 0)
from favourites base
left join totals t on t.favourite_id = base.id
where fv.id = base.id
  and (
    fv.all_time_pledged is distinct from coalesce(t.pledged, 0)
    or fv.all_time_count is distinct from coalesce(t.cnt, 0)
  );
