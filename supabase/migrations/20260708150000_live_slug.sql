-- Unguessable slug for the live display. The projector page moves from
-- /favpolls/[id]/live (guessable — favpoll ids are public) to /live/[slug]:
-- the display shows full standings + the reveal to the room, so access is
-- capability-based — only someone the organiser gave the link to can open it.
-- The wall endpoint's display mode authenticates with the same slug.
ALTER TABLE favpolls
  ADD COLUMN live_slug uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX favpolls_live_slug_idx ON favpolls (live_slug);
