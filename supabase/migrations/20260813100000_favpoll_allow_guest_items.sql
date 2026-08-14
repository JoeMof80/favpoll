-- Whether guests may add a favourite the organiser did not list.
--
-- Until now this was decided entirely by the TOPIC: guests could add to any
-- topic that is not is_finite, which is 124 of the 135 in the catalogue. The
-- organiser had no say beforehand — only the ability to hide an addition
-- afterwards, from the standings.
--
-- That was a thin reading of "at the discretion of the organiser", which is
-- what the features page promises, and it gets thinner the more the option is
-- advertised in the pledge dialog. This is the discretion, exercised up front.
--
-- Defaults to true: it is how every existing favpoll already behaves, and
-- turning it off should be a decision rather than a thing that happened.
alter table public.favpolls
  add column if not exists allow_guest_items boolean not null default true;

comment on column public.favpolls.allow_guest_items is
  'Organiser setting: may guests add a favourite that is not already listed? Topic.is_finite still overrides — a finite topic can never be added to.';
