create table if not exists generated_drafts (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  register text,
  topic_id uuid references topics(id) on delete cascade,
  primary_charity_id uuid references charities(id) on delete cascade,
  subject text,
  about text,
  reveal text,
  model text,
  status text not null default 'generated',
  created_at timestamptz not null default now()
);

comment on column generated_drafts.status is '''generated'' | ''curated'' | ''rejected''';
comment on column generated_drafts.primary_charity_id is 'null for person events; set to the first-listed charity for cause events';
