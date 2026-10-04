-- CHARITY PROFILES (references/charity-profiles-2026-09-27.md — the three
-- layers, and the five decisions of 2026-10-04). Layer two: what WE derived
-- about a charity that has agreed to nothing. The mirror
-- (register_charities) is layer one, knowledge; `charities` stays layer
-- three, the account, and nothing here touches it.
--
-- Keyed by the registered number as the register writes it, in TEXT —
-- `charities.registered_number` is text too, so account and profile join
-- without a cast, and a HAND-WRITTEN Scottish or Northern Irish profile
-- (§5) has a key at all, which an integer could never hold. The cost is
-- one cast when joining the mirror, whose key is an integer.
--
-- THE FLOOR (decision 1): a rule may name the topic FAMILY and never the
-- topic. `charity_topic_family()` reads the classification codes and
-- answers with one of our own catalogue categories — Animals, Nature,
-- Music, Books & Arts, Sport — or nothing. See the function for what it
-- refuses to say and why it was measured that narrow.
--
-- THE IMAGE (decision 2): `image_source` is stored beside the image so a
-- scraped og:image is never mistaken for a given one. og:image or favicon
-- only — an og:image is published FOR being shown elsewhere, a site's
-- photo library is not — and 'given' REPLACES it at onboarding rather than
-- sitting beside it, so a scraped image can never leak onto a public page.
--
-- STALENESS (decision 3): the four FINGERPRINTS are of the fields a
-- profile was DERIVED from — name, objects, activities, classification.
-- Comparing those and not `extract_date` is the whole point: almost every
-- row changes every extract (income and year-end update annually for all
-- 172k), so dating alone would flag the entire table and charge for
-- regenerations that change nothing. `charity_profiles_stale` does the
-- comparison, and it catches a change WITHIN one extract date, which
-- dating cannot.
--
-- Service-role only, like every other charity table: RLS on, no policies.

-- The floor names a category by LABEL, so the label has to be an identity
-- (it already is in the seed: 11 categories, 11 distinct labels).
alter table categories
  add constraint categories_label_key unique (label);

create table if not exists charity_profiles (
  -- The register's own identifier, normalised: 1089464, SC003558, NIC100000.
  -- Six to ten digits, not the six or seven everyone assumes: the register
  -- holds 19262026 (Queen Elizabeth Trust, a CIO registered in March 2026),
  -- which broke the first backfill. The register is the authority on its
  -- own numbering.
  registered_number text primary key
    check (
      registered_number = upper(btrim(registered_number))
      and registered_number ~ '^([0-9]{6,10}(-[0-9]+)?|SC[0-9]{3,6}|NIC[0-9]{3,6})$'
    ),

  -- THE FLOOR: a catalogue category, by rule, or nothing. The label and
  -- not the id, so the floor for 172k rows is one scan with no join —
  -- resolving ids per row cost 34 seconds, and joining them cost 20 more
  -- in a sort to disk.
  topic_family text
    references categories (label) on update cascade on delete set null,
  -- Which rule said so, so a changed mapping is recomputable. Null when
  -- no rule had anything to say.
  topic_family_rule text,

  -- THE IMAGE: preview surfaces only until the charity supplies its own.
  image_url text,
  image_source text check (image_source in ('og', 'favicon', 'given')),
  image_fetched_at timestamptz,

  -- STALENESS: md5 of each derived field as it stood when the profile was
  -- made. Null where the profile was not derived from that field.
  fp_name text,
  fp_objects text,
  fp_activities text,
  fp_classification text,
  -- The extract the fingerprints were taken from. NULL means no extract
  -- produced this profile: an admin wrote it by hand (§5).
  extract_date date,

  -- rule        the floor and nothing more
  -- drafted     the model has written it
  -- reviewed    an admin looked
  -- superseded  the charity replaced it at onboarding
  status text not null default 'rule'
    check (status in ('rule', 'drafted', 'reviewed', 'superseded')),
  generated_at timestamptz,
  model text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The wave's eligibility filter (step 2) slices on status and family.
create index if not exists charity_profiles_status
  on charity_profiles (status);
create index if not exists charity_profiles_topic_family
  on charity_profiles (topic_family)
  where topic_family is not null;

alter table charity_profiles enable row level security;

comment on table charity_profiles is
  'Layer two of the charity model: what we derived about a registered charity that has agreed to nothing. Keyed by registered number as text, so a hand-written Scottish or Northern Irish profile has a key. The rule floor is a catalogue category from the classification codes; everything richer is the model''s, and the account (charities) stays separate.';

-- ─── THE RULE FLOOR ────────────────────────────────────────────────────────
-- codes-v1, and it is as narrow as the measurement made it.
--
-- Five SUBJECT codes name a catalogue category honestly: Animals → Animals,
-- Environment/conservation/heritage → Nature (landscapes, rivers, gardens,
-- trees), Amateur Sport → Sport, Arts/culture/heritage/science → Books &
-- Arts (plays, poems, paintings), Religious Activities → Music (Hymn and
-- Carol live there, and that is as far as a code honestly reaches).
-- Priority is deliberate: a charity coded both Animals and Environment is
-- an animals charity (the RSPB).
--
-- THE MISSION GUARD, and why it is here. Measured against the 59 account
-- charities whose cause family the founder has confirmed: the subject
-- codes alone spoke for 14 and were wrong on 3 — the RNLI offered Books &
-- Arts (it carries an Arts code), FareShare offered Nature (food waste
-- carries Environment), RNIB offered Sport (one code of seven). In each
-- case a subject code sat incidentally on a charity whose work is care.
-- So a subject code is ignored when any MISSION code is present: health,
-- disability, poverty, overseas aid, housing. With the guard the rule
-- speaks for 11 of the 59 and is right 11 times out of 11; it covers 36%
-- of the register rather than 51%. That trade is decision 1's own
-- reasoning — the bad failure is confidently offering a cheerful
-- favourite to a charity whose business is grief or need, and silence
-- costs nothing because the model still runs.
--
-- And never a CAUSE family. Measured on the same 59: mapping these codes
-- to our cause families gets 26 of 59 right and fails worst where it
-- matters — every hospice comes out health_condition, every mental-health
-- charity comes out health_condition, Age UK comes out homelessness. The
-- WHO axis is no better: "Children/young People" is ticked by 95,769
-- charities, five of our seven hospices among them. The cause family
-- stays the model's suggestion on the charity's own words
-- (apps/web/lib/cause-family.ts, which measured the same thing in
-- September).
create or replace function charity_topic_family(p_classification jsonb)
returns text
language sql
immutable
as $$
  select case
    when p_classification->'what' ?| array[
      'The Advancement Of Health Or Saving Of Lives',
      'Disability',
      'The Prevention Or Relief Of Poverty',
      'Overseas Aid/famine Relief',
      'Accommodation/housing'
    ] then null
    when p_classification->'what' ? 'Animals' then 'Animals'
    when p_classification->'what' ? 'Environment/conservation/heritage'
      then 'Nature'
    when p_classification->'what' ? 'Amateur Sport' then 'Sport'
    when p_classification->'what' ? 'Arts/culture/heritage/science'
      then 'Books & Arts'
    when p_classification->'what' ? 'Religious Activities' then 'Music'
  end;
$$;

comment on function charity_topic_family is
  'The rule floor (codes-v1): the catalogue category a charity''s classification codes name, or null where they name nothing or a mission code (health, disability, poverty, overseas aid, housing) makes a subject code incidental. Family only, never a topic, and never a cause family, which the codes cannot tell apart.';

-- ─── THE FLOOR, FOR EVERY REGISTERED CHARITY ───────────────────────────────
-- One definition of what the floor IS, so the backfill and every later
-- refresh cannot drift apart.
create or replace view register_profile_floor as
select
  r.registered_number::text as registered_number,
  charity_topic_family(r.classification) as topic_family,
  case
    when charity_topic_family(r.classification) is not null then 'codes-v1'
  end as topic_family_rule,
  md5(coalesce(r.name, '')) as fp_name,
  md5(coalesce(r.objects, '')) as fp_objects,
  md5(coalesce(r.activities, '')) as fp_activities,
  md5(coalesce(r.classification::text, '')) as fp_classification,
  r.extract_date
from register_charities r
where r.status = 'Registered';

comment on view register_profile_floor is
  'What a profile holds for a charity nobody has touched: the rule-floor category and the fingerprints of the four derived fields. The source for refresh_charity_profiles().';

-- Run at the end of a mirror load, and once to backfill. Inserts a profile
-- for every Registered charity that has none, and refreshes the floor on
-- rows that are still only a floor. A drafted, reviewed or superseded
-- profile is never touched — including its fingerprints, which are the
-- record of what it was derived from and the thing staleness compares
-- against.
create or replace function refresh_charity_profiles()
returns json
language plpgsql
as $$
declare
  v_inserted bigint;
  v_updated bigint;
begin
  -- The mirror is read ONCE, into narrow rows. Reading it is unavoidable
  -- (the fingerprints are md5s of its long text columns); carrying
  -- 961-byte rows into a join is not. An earlier shape let the planner
  -- sort 172k of them to disk — 172MB of temp files and 20 seconds for an
  -- update that changed nothing.
  create temporary table floor_now on commit drop as
    select
      registered_number, topic_family, topic_family_rule,
      fp_name, fp_objects, fp_activities, fp_classification, extract_date
    from register_profile_floor;
  create unique index on floor_now (registered_number);
  analyze floor_now;

  with ins as (
    insert into charity_profiles (
      registered_number, topic_family, topic_family_rule,
      fp_name, fp_objects, fp_activities, fp_classification, extract_date
    )
    select
      f.registered_number, f.topic_family, f.topic_family_rule,
      f.fp_name, f.fp_objects, f.fp_activities, f.fp_classification,
      f.extract_date
    from floor_now f
    on conflict (registered_number) do nothing
    returning 1
  )
  select count(*) into v_inserted from ins;

  with upd as (
    update charity_profiles p
    set
      topic_family = f.topic_family,
      topic_family_rule = f.topic_family_rule,
      fp_name = f.fp_name,
      fp_objects = f.fp_objects,
      fp_activities = f.fp_activities,
      fp_classification = f.fp_classification,
      extract_date = f.extract_date,
      updated_at = now()
    from floor_now f
    where f.registered_number = p.registered_number
      and p.status = 'rule'
      and (
        p.topic_family is distinct from f.topic_family
        or p.fp_name is distinct from f.fp_name
        or p.fp_objects is distinct from f.fp_objects
        or p.fp_activities is distinct from f.fp_activities
        or p.fp_classification is distinct from f.fp_classification
      )
    returning 1
  )
  select count(*) into v_updated from upd;

  return json_build_object('inserted', v_inserted, 'updated', v_updated);
end;
$$;

revoke execute on function refresh_charity_profiles() from public, anon, authenticated;

comment on function refresh_charity_profiles is
  'Writes the rule floor for every Registered charity: inserts the profiles that do not exist, refreshes the ones that are still only a floor. Never touches a drafted, reviewed or superseded profile — its fingerprints are what staleness compares against. Run at the end of a mirror load.';

-- ─── STALENESS ─────────────────────────────────────────────────────────────
-- A profile whose derived fields have moved since it was made. Only
-- profiles with model work in them can be stale: a floor is refreshed in
-- place, and a charity that has LEFT the register is a removal, not
-- staleness (register_account_removals()).
create or replace view charity_profiles_stale as
select
  p.registered_number,
  r.name,
  p.status,
  p.generated_at,
  p.extract_date as derived_from,
  r.extract_date as current_extract,
  array_remove(array[
    case when p.fp_name is not null
      and p.fp_name <> md5(coalesce(r.name, '')) then 'name' end,
    case when p.fp_objects is not null
      and p.fp_objects <> md5(coalesce(r.objects, '')) then 'objects' end,
    case when p.fp_activities is not null
      and p.fp_activities <> md5(coalesce(r.activities, ''))
      then 'activities' end,
    case when p.fp_classification is not null
      and p.fp_classification <> md5(coalesce(r.classification::text, ''))
      then 'classification' end
  ], null) as changed
from charity_profiles p
join register_charities r
  on r.registered_number::text = p.registered_number
where p.status in ('drafted', 'reviewed')
  and (
    (p.fp_name is not null and p.fp_name <> md5(coalesce(r.name, '')))
    or (p.fp_objects is not null
      and p.fp_objects <> md5(coalesce(r.objects, '')))
    or (p.fp_activities is not null
      and p.fp_activities <> md5(coalesce(r.activities, '')))
    or (p.fp_classification is not null
      and p.fp_classification <> md5(coalesce(r.classification::text, '')))
  );

comment on view charity_profiles_stale is
  'Profiles with model work in them whose derived fields (name, objects, activities, classification) have moved since they were written, and which fields moved. The comparison staleness is allowed to make — never extract_date, which changes for all 172k every extract.';
