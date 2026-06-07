-- Add is_exemplar flag to events.
-- Exemplar events are hand-curated closed events used as inspiration content
-- in the "See real favpolls like this" inspiration door.
alter table events add column is_exemplar boolean not null default false;
