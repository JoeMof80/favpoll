-- Cause suggestions now include a generated cause name + context line
-- (normalised structure: causes have optional photo/context like persons,
-- and the generator fills the empty hero fields).
alter table generated_drafts
  add column if not exists cause_label text,
  add column if not exists context text;
