-- THE REMOVAL CHECK (references/charity-profiles-2026-09-27.md §3,
-- founder's decision 2026-10-04). REMOVAL IS NOT STALENESS: a charity
-- that has left the register is WRONG, not old. Staleness is compared on
-- the derived fields and regenerated lazily; a removal is read at LOAD
-- TIME, because the one failure here with real consequences is money
-- moving to a deregistered charity.
--
-- This reads the standing of every ACCOUNT charity (`charities`, the
-- consenting relationship) against the mirror (`register_charities`,
-- knowledge). Three verdicts, not one:
--
--   removed   the mirror says the status is not Registered, or carries a
--             removal date. Loud: an account points at a charity the
--             Commission has deregistered.
--   gone      the latest extract did not include the row at all (its
--             extract_date is behind the mirror's newest). Either a
--             deregistration that never got a Removed row, or — the
--             benign cause — a load that stopped half way, which is why
--             this one warns rather than blocks.
--   unknown   a registered number with no mirror row: registered since
--             the extract, a linked (subsidiary) number, or a typo. The
--             Commission API still verifies these, so this one is quiet.
--
-- Money travels with each row, because it is what makes a removal
-- urgent rather than tidy: the favpolls pointing at the account, its
-- equal split of their raised total (the product rule, exemplars
-- excluded as everywhere else), disbursements still pending, and the
-- Gift Aid declarations a deregistered charity can no longer claim on.
-- Those reads hang off the short offender list, one charity at a time,
-- so a database where nothing is wrong never touches a pledge — the
-- first shape aggregated every favpoll up front and outran PostgREST's
-- statement timeout on a clean dev database.
--
-- Service-role only, like every other charity read.

-- The yardstick for "not in the latest extract" is max(extract_date),
-- and without this that is a 3.4s parallel seq scan of 358k wide rows —
-- enough on its own to outrun the API's statement timeout. The index
-- makes it an index-only read, and the staleness comparison the profiles
-- note describes will want it too.
create index if not exists register_charities_extract_date
  on register_charities (extract_date);

create or replace function register_account_removals()
returns json
language sql
stable
as $$
  with accounts as (
    select
      c.id,
      c.name,
      c.registered_number,
      c.is_active,
      c.consent_status,
      nullif(regexp_replace(c.registered_number, '\D', '', 'g'), '')::bigint
        as number
    from charities c
    where c.registered_number is not null
  ),
  -- The mirror's own newest extract: the yardstick for "not in the
  -- latest extract", since the loader upserts and never deletes.
  newest as (
    select max(extract_date) as extract_date from register_charities
  ),
  -- Only the accounts whose standing is not a clean Registered. Every
  -- money read below hangs off this set, so a database where nothing is
  -- wrong never touches a pledge.
  offenders as (
    select
      a.id,
      a.name,
      a.registered_number,
      a.is_active,
      a.consent_status,
      r.name as register_name,
      r.status as register_status,
      r.removed_on,
      r.extract_date,
      n.extract_date as latest_extract,
      case
        when r.registered_number is null then 'unknown'
        when r.status <> 'Registered' or r.removed_on is not null
          then 'removed'
        when n.extract_date is not null and r.extract_date < n.extract_date
          then 'gone'
      end as verdict
    from accounts a
    cross join newest n
    left join register_charities r on r.registered_number = a.number
    where r.registered_number is null
       or r.status <> 'Registered'
       or r.removed_on is not null
       or (n.extract_date is not null and r.extract_date < n.extract_date)
  )
  select coalesce(json_agg(obj order by rank, raised desc, name), '[]'::json)
  from (
    select
      s.name,
      case s.verdict when 'removed' then 0 when 'gone' then 1 else 2 end
        as rank,
      m.raised,
      json_build_object(
        'charity_id', s.id,
        'name', s.name,
        'registered_number', s.registered_number,
        'verdict', s.verdict,
        'is_active', s.is_active,
        'consent_status', s.consent_status,
        'register_name', s.register_name,
        'register_status', s.register_status,
        'removed_on', s.removed_on,
        'extract_date', s.extract_date,
        'latest_extract', s.latest_extract,
        'favpoll_count', m.favpoll_count,
        'open_count', m.open_count,
        'raised', m.raised,
        'pending_disbursements', p.n,
        'pending_amount', p.amount,
        'gift_aid_declarations', g.n
      ) as obj
    from offenders s
    -- The favpolls pointing at this account, and its equal split of what
    -- they raised: the same rule as charity_stats (proceeds split equally
    -- across a favpoll's charities, exemplars excluded), read one
    -- charity at a time because this list is short.
    left join lateral (
      select
        count(distinct fc.favpoll_id) as favpoll_count,
        count(distinct fc.favpoll_id) filter (where f.closed_at is null)
          as open_count,
        coalesce(sum(case when cc.n > 0 then ft.raised / cc.n else 0 end), 0)
          as raised
      from favpoll_charities fc
      join favpolls f
        on f.id = fc.favpoll_id and f.is_exemplar is not true
      left join lateral (
        select coalesce(sum(pl.total_amount), 0) as raised
        from favpoll_polls fp
        join pledges pl
          on pl.favpoll_poll_id = fp.id and pl.withdrawn_at is null
        where fp.favpoll_id = fc.favpoll_id
      ) ft on true
      left join lateral (
        select count(*) as n
        from favpoll_charities x
        where x.favpoll_id = fc.favpoll_id
      ) cc on true
      where fc.charity_id = s.id
    ) m on true
    left join lateral (
      select count(*) as n, coalesce(sum(d.amount), 0) as amount
      from disbursements d
      where d.charity_id = s.id and d.status = 'pending'
    ) p on true
    -- Declarations a deregistered charity can no longer claim on.
    left join lateral (
      select count(*) as n
      from gift_aid_declarations ga
      join pledges pl on pl.id = ga.pledge_id and pl.withdrawn_at is null
      join favpoll_polls fp on fp.id = pl.favpoll_poll_id
      join favpolls f
        on f.id = fp.favpoll_id and f.is_exemplar is not true
      join favpoll_charities fc
        on fc.favpoll_id = f.id and fc.charity_id = s.id
    ) g on true
  ) ranked;
$$;

revoke execute on function register_account_removals() from public, anon, authenticated;

comment on function register_account_removals is
  'Account charities whose standing on the register is not a clean Registered: removed (deregistered), gone (absent from the latest extract) or unknown (no mirror row), with the money pointing at each. Read at load time by scripts/register/load-register.ts and shown on admin /charities.';
