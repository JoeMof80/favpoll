-- Hot-path FK indexes (2026-07-21). Found by the scale seed: none of the
-- money tables' FK columns were indexed, so once pledges reached tens of
-- thousands of rows every PostgREST embed (allocations per pledge, pledges
-- per poll) became a sequential scan and poll pages died on Postgres's
-- statement timeout. Indexes over the columns every hot read filters on:

create index if not exists pledges_favpoll_poll_id_idx
  on pledges (favpoll_poll_id);

create index if not exists pledge_allocations_pledge_id_idx
  on pledge_allocations (pledge_id);

create index if not exists pledge_allocations_favourite_id_idx
  on pledge_allocations (favourite_id);

create index if not exists favourites_topic_id_idx
  on favourites (topic_id);

create index if not exists favpoll_charities_favpoll_id_idx
  on favpoll_charities (favpoll_id);

create index if not exists favpoll_pots_favpoll_id_idx
  on favpoll_pots (favpoll_id);

create index if not exists pot_allocations_pot_id_idx
  on pot_allocations (pot_id);

-- The reconcile cron's backlog scan (reconciled_at is null, ordered by age)
create index if not exists stripe_payment_events_unreconciled_idx
  on stripe_payment_events (received_at)
  where reconciled_at is null;
