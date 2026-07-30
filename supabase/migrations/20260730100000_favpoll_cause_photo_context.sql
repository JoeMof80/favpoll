-- Normalise the favpoll structure across subjects: cause favpolls gain an
-- optional image and context line, matching person favpolls (which store
-- these on the protagonist row — causes have no protagonist).
alter table favpolls
  add column if not exists photo_url text,
  add column if not exists context text;
