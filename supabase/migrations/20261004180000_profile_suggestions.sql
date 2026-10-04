-- THE PROFILE BECOMES WHERE SUGGESTIONS LIVE (step 2 of
-- references/charity-profiles-2026-09-27.md, "what moves, what stays").
--
-- A suggestion is not an agreement. The model's reading of a charity —
-- its perfect topic, the subset, the reason, the cause family it looks
-- like, the fundraising events on its website — was stored on `charities`
-- because `charities` was the only table there was. It belongs on the
-- PROFILE, keyed by registered number, so it can exist for the 172k
-- charities that have no account and never asked for one.
--
-- What STAYS on the account: everything agreed. The confirmed
-- `perfect_topic_id`, `perfect_subset_id` and `cause_family` are an
-- admin's or the charity's decision, not a derivation.
--
-- The old columns are CARRIED OVER here and then left alone — read by
-- nothing, dropped in step 5 with the register copies. Copying and
-- dropping in one migration would make a rollback a data loss.
--
-- `cause_family_suggested` moves too. The note's list predates it, but it
-- is the same species as the rest: a model's guess at what a charity is,
-- with the confirmed value beside it on the account.

alter table charity_profiles
  add column if not exists perfect_topic_suggested_id uuid
    references topics (id) on delete set null,
  add column if not exists perfect_subset_suggested_id uuid
    references topic_subsets (id) on delete set null,
  add column if not exists perfect_topic_reason text,
  add column if not exists cause_family_suggested text,
  add column if not exists signature_events jsonb,
  add column if not exists website_read_at timestamptz;

comment on column charity_profiles.perfect_topic_suggested_id is
  'The model''s suggestion. The CONFIRMED topic stays on charities.perfect_topic_id — an agreement, not a derivation.';
comment on column charity_profiles.signature_events is
  'The fundraising events read from the charity''s own website: a reading of a site, never an agreement.';

-- Carry over what `charities` already holds, for every account charity
-- whose number the profile key accepts (a number that does not conform is
-- left behind deliberately rather than mangled — it is a typo or an
-- off-register number, and `charity_profiles_unkeyable` below names them).
--
-- A profile row is created where the floor has none: an account charity
-- the register has REMOVED has no floor profile, because the floor covers
-- Registered rows only, and its suggestions must not vanish with it. Those
-- rows get their floor and fingerprints from the mirror here, since the
-- refresh will never touch them again once they are drafted.
--
-- distinct on, not an aggregate: `charities.registered_number` has no
-- unique constraint, so two accounts could share a number. The most
-- recently read site wins, deterministically.
insert into charity_profiles (
  registered_number, status, topic_family, topic_family_rule,
  fp_name, fp_objects, fp_activities, fp_classification, extract_date,
  perfect_topic_suggested_id, perfect_subset_suggested_id,
  perfect_topic_reason, cause_family_suggested,
  signature_events, website_read_at
)
select distinct on (upper(btrim(c.registered_number)))
  upper(btrim(c.registered_number)),
  'drafted',
  charity_topic_family(r.classification),
  case
    when charity_topic_family(r.classification) is not null then 'codes-v1'
  end,
  case when r.registered_number is not null
    then md5(coalesce(r.name, '')) end,
  case when r.registered_number is not null
    then md5(coalesce(r.objects, '')) end,
  case when r.registered_number is not null
    then md5(coalesce(r.activities, '')) end,
  case when r.registered_number is not null
    then md5(coalesce(r.classification::text, '')) end,
  r.extract_date,
  c.perfect_topic_suggested_id,
  c.perfect_subset_suggested_id,
  c.perfect_topic_reason,
  c.cause_family_suggested,
  c.signature_events,
  c.website_read_at
from charities c
left join register_charities r
  on r.registered_number::text = upper(btrim(c.registered_number))
where c.registered_number is not null
  and upper(btrim(c.registered_number)) ~
    '^([0-9]{6,10}(-[0-9]+)?|SC[0-9]{3,6}|NIC[0-9]{3,6})$'
  and (
    c.perfect_topic_suggested_id is not null
    or c.perfect_subset_suggested_id is not null
    or c.perfect_topic_reason is not null
    or c.cause_family_suggested is not null
    or c.signature_events is not null
    or c.website_read_at is not null
  )
order by
  upper(btrim(c.registered_number)),
  c.website_read_at desc nulls last,
  c.created_at desc nulls last
on conflict (registered_number) do update
set
  perfect_topic_suggested_id =
    coalesce(charity_profiles.perfect_topic_suggested_id,
             excluded.perfect_topic_suggested_id),
  perfect_subset_suggested_id =
    coalesce(charity_profiles.perfect_subset_suggested_id,
             excluded.perfect_subset_suggested_id),
  perfect_topic_reason =
    coalesce(charity_profiles.perfect_topic_reason,
             excluded.perfect_topic_reason),
  cause_family_suggested =
    coalesce(charity_profiles.cause_family_suggested,
             excluded.cause_family_suggested),
  signature_events =
    coalesce(charity_profiles.signature_events, excluded.signature_events),
  website_read_at =
    coalesce(charity_profiles.website_read_at, excluded.website_read_at),
  -- A floor that now carries the model's work is drafted, not a floor.
  status = case
    when charity_profiles.status = 'rule' then 'drafted'
    else charity_profiles.status
  end,
  updated_at = now();

-- An account number the profile key cannot hold: a typo, or an
-- off-register regulator we do not mirror. Named rather than mangled, so
-- an admin can see what was left behind.
create or replace view charity_profiles_unkeyable as
select c.id, c.name, c.registered_number, c.consent_status, c.is_active
from charities c
where c.registered_number is not null
  and upper(btrim(c.registered_number)) !~
    '^([0-9]{6,10}(-[0-9]+)?|SC[0-9]{3,6}|NIC[0-9]{3,6})$';

comment on view charity_profiles_unkeyable is
  'Account charities whose registered number is not a shape the profile key accepts — a typo, or an off-register regulator. They have no profile and never will until the number is corrected.';

-- ─── THE WAVE'S ELIGIBILITY FILTER ─────────────────────────────────────────
-- Decision 4: the batch filter is the lever, not the model price. "Half of
-- it on parish halls with nothing to write about" is avoidable before a
-- single call, with free SQL on a table we already hold.
--
-- Four clauses, and measured on the dev mirror they are the whole cost
-- argument:
--
--   Registered                              171,909
--   + has a website                         103,392   (no site: no og:image,
--                                                      no events, nothing to
--                                                      read beyond the filing)
--   + a classification the floor maps        40,255   (a family we serve)
--   + income >= £100,000                     12,904
--
-- 93% of the register is gone before the model is asked anything. The
-- floor is an argument, not a law: £25k leaves 22,341 and £500k leaves
-- 3,687 (the animals-and-environment pilot's own slice), so a wave passes
-- the number it wants.
--
-- Charities that already have an ACCOUNT are excluded: a wave is cold
-- outreach, and a charity we already hold a relationship with is the
-- consent queue's business, not a wave's.
-- p_limit is not a nicety: 12,893 rows is more than the API's statement
-- timeout will serialise, and a wave only ever wants the top of the list.
create or replace function charity_outreach_candidates(
  p_income_floor bigint default 100000,
  p_limit integer default null
)
returns table (
  registered_number text,
  name text,
  website text,
  latest_income bigint,
  topic_family text,
  profile_status text,
  has_topic_suggestion boolean,
  website_read_at timestamptz
)
language sql
stable
as $$
  select
    p.registered_number,
    r.name,
    r.website,
    r.latest_income,
    p.topic_family,
    p.status,
    p.perfect_topic_suggested_id is not null or p.perfect_topic_reason is not null,
    p.website_read_at
  from charity_profiles p
  join register_charities r
    on r.registered_number::text = p.registered_number
  where r.status = 'Registered'
    and r.website is not null
    and p.topic_family is not null
    and coalesce(r.latest_income, 0) >= p_income_floor
    and not exists (
      select 1 from charities c
      where upper(btrim(c.registered_number)) = p.registered_number
    )
  order by r.latest_income desc nulls last, r.name
  limit p_limit;
$$;

revoke execute on function charity_outreach_candidates(bigint, integer)
  from public, anon, authenticated;

comment on function charity_outreach_candidates is
  'The charities a cold outreach wave may spend model money on: Registered, with a website, with a classification the rule floor maps, above an income floor, and without an account already. Decision 4''s filter — it removes 93% of the register before a single model call.';

-- ─── THE SPEND CAP ─────────────────────────────────────────────────────────
-- Decision 4 asks for a cap "per outreach wave, with a cap covering admin
-- on-demand touches as well — clicking through the queue is the motion
-- that spends invisibly". So the cap is not a flag a wave script passes:
-- the check lives where the model is CALLED (apps/web/lib/model-spend.ts),
-- and every path — a wave, a backfill, an admin's click — pays into this
-- one ledger.
--
-- Cost is USD micros, computed in code from Anthropic's published rates.
-- It is a budget, not an invoice: an unpriced model records zero, so the
-- gap shows up as rows with no cost rather than as a silent undercount.
create table if not exists model_spend (
  id uuid primary key default gen_random_uuid(),
  -- One name per kind of call, so the ledger says where the money went:
  -- model per task, not per pipeline (the none/not-none judgement is worth
  -- the better model; summarising either side of it is not).
  task text not null,
  model text not null,
  -- The charity it was spent on, where there is one.
  registered_number text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cache_read_tokens integer not null default 0,
  cost_micros bigint not null default 0,
  -- A label a wave passes, so one campaign's spend can be read back.
  wave text,
  created_at timestamptz not null default now()
);

create index if not exists model_spend_created_at
  on model_spend (created_at desc);
create index if not exists model_spend_wave
  on model_spend (wave) where wave is not null;

alter table model_spend enable row level security;

comment on table model_spend is
  'One row per model call made for profile work, with its cost in USD micros from the published rates. The cap reads it; nothing else does. A budget, never an invoice.';

-- The month's spend, in one round trip, for the cap check.
create or replace function model_spend_since(p_from timestamptz)
returns json
language sql
stable
as $$
  select json_build_object(
    'calls', count(*),
    'cost_micros', coalesce(sum(cost_micros), 0),
    'by_task', coalesce(
      (select json_object_agg(task, cost)
       from (
         select task, coalesce(sum(cost_micros), 0) as cost
         from model_spend where created_at >= p_from
         group by task
       ) t),
      '{}'::json)
  )
  from model_spend
  where created_at >= p_from;
$$;

revoke execute on function model_spend_since(timestamptz)
  from public, anon, authenticated;

comment on function model_spend_since is
  'Spend since a moment: total, call count, and the split by task. Read by the cap before every model call for profile work.';
