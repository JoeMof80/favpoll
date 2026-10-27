-- A WIZARD DRAFT THAT OUTLIVES THE SIGN-IN.
--
-- /favpolls/new is a private route today, so the first thing a visitor meets
-- after pressing "Create a favpoll" is a login — before anything has shown
-- them what a favpoll is. The hero's own comment makes the case against
-- that: "Create a favpoll" names an invented noun, so the wall arrives
-- before the definition does.
--
-- Moving the ask to Publish means the wizard has to survive leaving the
-- page. `<SignIn>` lives at its own route (app/sign-in/[[...sign-in]]), so
-- pressing Publish while signed out is a full navigation: React state is
-- gone, and so is any File the visitor picked. Browser storage is not an
-- answer either — Clerk can finish a verification in a different tab, and
-- that is precisely the case that would cost someone the whole favpoll.
--
-- So the draft lives here, keyed by an id the visitor carries in a cookie.
--
-- SHAPE: one jsonb payload rather than a column per field. This table is a
-- waiting room, not a model — the wizard already has its schema in
-- components/favpoll-form/schema.ts, and mirroring thirty optional fields
-- into columns would mean a migration every time that schema moves. Nothing
-- queries inside the payload; it is written whole and read whole.
create table public.wizard_drafts (
  id uuid primary key default gen_random_uuid(),

  -- The wizard's values, as the client holds them, minus the photo.
  payload jsonb not null,

  -- The photo is uploaded before the draft is saved, because a File cannot
  -- be serialised and cannot survive the navigation. An anonymous visitor
  -- has no user id to key storage by, so it lands under the draft id and is
  -- moved to the organiser on claim. Null until they pick one.
  photo_path text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Set when the draft becomes a favpoll. Kept rather than deleted so a
  -- double submit is answerable: a claimed draft publishes nothing twice.
  claimed_at timestamptz,
  claimed_by text
);

-- Pruning reads by age, and the claimed ones go first.
create index wizard_drafts_created_at_idx on public.wizard_drafts (created_at);

-- RLS ON WITH NO POLICIES, the same posture as every table holding anything
-- a visitor typed. Server actions reach this through the service role, which
-- bypasses RLS; the publishable browser key gets nothing. A draft is
-- addressable by a uuid someone holds in a cookie, so an anon SELECT policy
-- would make every draft readable to anyone who guessed one — and these
-- carry names, photos and the About text before anybody has agreed to
-- publish them.
alter table public.wizard_drafts enable row level security;

comment on table public.wizard_drafts is
  'The wizard''s waiting room: what a signed-out visitor typed, carried across the sign-in by an id in an httpOnly cookie. RLS on with no policies - server actions reach it through the service role, the browser key gets nothing. Claimed rows are kept as the double-submit guard and are never pruned, because their photo may still be the live file of a published favpoll.';
