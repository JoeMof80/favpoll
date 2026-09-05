-- Appeals: JustGiving-style parent campaigns, favpoll-shaped
-- (concept: references/appeals-concept-2026-09-05.md, #707; founder
-- settled the open questions 2026-09-05).
-- Applied to STAGING by hand via the dashboard SQL editor,
-- 2026-09-05 (the MCP OAuth client is broken; house precedent from
-- the 2026-08-05 RLS migration). Production: apply at the launch flip.
--
-- An appeal is an AGGREGATION VIEW — no money moves through it.
-- Members are ordinary favpolls with appeal_id set at creation via the
-- join link; their charity is locked to the appeal's (server-enforced
-- in create/updateFavpoll), and when the appeal has an end date the
-- member inherits min(appeal end, creation + 90d). closes_at is NULL
-- for evergreen appeals (a hospice's always-on In Memory programme) —
-- members then pick their own dates.
create table if not exists public.appeals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  blurb text,
  photo_url text,
  charity_id uuid not null references public.charities(id),
  created_by text not null,
  opens_at timestamptz not null default now(),
  closes_at timestamptz,
  is_listed boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.appeals is
  'Parent appeals: many favpolls, one charity, one aggregate. Aggregation only — pledges flow per-favpoll as always.';

-- Service-role surface for v1 (no self-serve creation; appeal pages
-- read via the server) — the house enable-RLS-no-policies pattern.
alter table public.appeals enable row level security;

alter table public.favpolls
  add column if not exists appeal_id uuid references public.appeals(id);

create index if not exists favpolls_appeal_id_idx
  on public.favpolls(appeal_id) where appeal_id is not null;

comment on column public.favpolls.appeal_id is
  'Membership of a parent appeal. Set at creation via the join link, locking the charity to the appeal''s.';

-- The appeal's live aggregate — favpoll_live_totals' shape, one level
-- up. Live members sum their non-withdrawn pledges; closed members
-- contribute their settled total_raised. Service-role only.
create or replace function appeal_live_totals(p_appeal_ids uuid[])
returns table (appeal_id uuid, raised numeric, member_count bigint)
language sql
stable
as $$
  select
    f.appeal_id,
    coalesce(sum(
      case
        when f.closed_at is not null then f.total_raised
        else coalesce(live.raised, 0)
      end
    ), 0) as raised,
    count(f.id) as member_count
  from favpolls f
  left join lateral (
    select coalesce(sum(pl.total_amount), 0) as raised
    from favpoll_polls fp
    join pledges pl
      on pl.favpoll_poll_id = fp.id and pl.withdrawn_at is null
    where fp.favpoll_id = f.id
  ) live on f.closed_at is null
  where f.appeal_id = any(p_appeal_ids)
  group by f.appeal_id
$$;

revoke execute on function appeal_live_totals(uuid[]) from public, anon, authenticated;
