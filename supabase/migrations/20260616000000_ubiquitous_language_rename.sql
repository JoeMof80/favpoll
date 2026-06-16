-- Ubiquitous language rename: favpoll is both the brand and the top-level
-- entity. events -> favpolls, topic_items -> favourites, plus every FK
-- column and dependent trigger/function/RLS policy that names them.
-- All data is junk pre-rename — truncate first, then rename, then reseed
-- with `pnpm seed`.

begin;

-- 1. Truncate all data (will be reseeded via `pnpm seed`)
truncate table
  public.pot_allocations,
  public.pledge_allocations,
  public.pledges,
  public.event_poll_items,
  public.event_polls,
  public.event_charities,
  public.event_pots,
  public.event_invites,
  public.topic_items,
  public.charity_topics,
  public.topic_categories,
  public.generated_drafts,
  public.events,
  public.topics,
  public.charities,
  public.protagonists,
  public.categories,
  public.users
restart identity cascade;

-- 2. Drop the trigger before changing the function it depends on
drop trigger if exists on_pledge_allocation_change on public.pledge_allocations;
drop function if exists public.update_topic_item_totals();

-- 3. Rename tables
alter table public.events rename to favpolls;
alter table public.event_polls rename to favpoll_polls;
alter table public.event_poll_items rename to favpoll_poll_favourites;
alter table public.event_charities rename to favpoll_charities;
alter table public.event_pots rename to favpoll_pots;
alter table public.event_invites rename to favpoll_invites;
alter table public.topic_items rename to favourites;

-- 4. Rename columns on favpolls (formerly events)
alter table public.favpolls rename column event_category to category;
alter table public.favpolls rename column event_grouping to "grouping";
alter table public.favpolls rename column event_subject to subject;

-- 5. Rename FK columns throughout
alter table public.favpoll_polls rename column event_id to favpoll_id;
alter table public.favpoll_poll_favourites rename column event_poll_id to favpoll_poll_id;
alter table public.favpoll_poll_favourites rename column topic_item_id to favourite_id;
alter table public.favpoll_charities rename column event_id to favpoll_id;
alter table public.favpoll_pots rename column event_id to favpoll_id;
alter table public.favpoll_invites rename column event_id to favpoll_id;
alter table public.pledges rename column event_poll_id to favpoll_poll_id;
alter table public.pledge_allocations rename column topic_item_id to favourite_id;

-- 6. Rename constraints (and their backing indexes) for clarity — behaviour-preserving
alter table public.favpoll_polls rename constraint event_polls_event_id_fkey to favpoll_polls_favpoll_id_fkey;
alter table public.favpoll_polls rename constraint event_polls_topic_id_fkey to favpoll_polls_topic_id_fkey;
alter table public.favpoll_polls rename constraint event_polls_pkey to favpoll_polls_pkey;
alter table public.favpoll_polls rename constraint event_polls_event_id_unique to favpoll_polls_favpoll_id_unique;

alter table public.favpoll_poll_favourites rename constraint event_poll_items_event_poll_id_fkey to favpoll_poll_favourites_favpoll_poll_id_fkey;
alter table public.favpoll_poll_favourites rename constraint event_poll_items_topic_item_id_fkey to favpoll_poll_favourites_favourite_id_fkey;
alter table public.favpoll_poll_favourites rename constraint event_poll_items_pkey to favpoll_poll_favourites_pkey;
alter table public.favpoll_poll_favourites rename constraint event_poll_items_event_poll_id_topic_item_id_key to favpoll_poll_favourites_favpoll_poll_id_favourite_id_key;

alter table public.favpoll_charities rename constraint event_charities_event_id_fkey to favpoll_charities_favpoll_id_fkey;
alter table public.favpoll_charities rename constraint event_charities_charity_id_fkey to favpoll_charities_charity_id_fkey;
alter table public.favpoll_charities rename constraint event_charities_pkey to favpoll_charities_pkey;

alter table public.favpoll_pots rename constraint event_pots_event_id_fkey to favpoll_pots_favpoll_id_fkey;
alter table public.favpoll_pots rename constraint event_pots_created_by_fkey to favpoll_pots_created_by_fkey;
alter table public.favpoll_pots rename constraint event_pots_pkey to favpoll_pots_pkey;

alter table public.favpoll_invites rename constraint event_invites_event_id_fkey to favpoll_invites_favpoll_id_fkey;
alter table public.favpoll_invites rename constraint event_invites_pkey to favpoll_invites_pkey;

alter table public.favpolls rename constraint events_created_by_fkey to favpolls_created_by_fkey;
alter table public.favpolls rename constraint events_protagonist_id_fkey to favpolls_protagonist_id_fkey;
alter table public.favpolls rename constraint events_pkey to favpolls_pkey;

alter table public.favourites rename constraint topic_items_topic_id_fkey to favourites_topic_id_fkey;
alter table public.favourites rename constraint topic_items_pkey to favourites_pkey;

alter table public.pledges rename constraint pledges_event_poll_id_fkey to pledges_favpoll_poll_id_fkey;

alter table public.pledge_allocations rename constraint pledge_allocations_topic_item_id_fkey to pledge_allocations_favourite_id_fkey;

-- 7. Rewrite update_topic_item_totals() as update_favourite_totals(), recreate trigger
create function public.update_favourite_totals()
returns trigger
language plpgsql
as $function$
begin
  update favourites
  set
    all_time_pledged = (
      select coalesce(sum(pa.amount), 0)
      from pledge_allocations pa
      join pledges p on p.id = pa.pledge_id
      where pa.favourite_id = coalesce(new.favourite_id, old.favourite_id)
      and p.withdrawn_at is null
    ),
    all_time_count = (
      select count(*)
      from pledge_allocations pa
      join pledges p on p.id = pa.pledge_id
      where pa.favourite_id = coalesce(new.favourite_id, old.favourite_id)
      and p.withdrawn_at is null
    )
  where id = coalesce(new.favourite_id, old.favourite_id);
  return new;
end;
$function$;

create trigger on_pledge_allocation_change
after insert or update on public.pledge_allocations
for each row execute function public.update_favourite_totals();

-- 8. Rename RLS policies for clarity (quals untouched — none referenced renamed columns)
alter policy "Anyone can read event_charities" on public.favpoll_charities rename to "Anyone can read favpoll_charities";
alter policy "Anyone can read event polls" on public.favpoll_polls rename to "Anyone can read favpoll polls";
alter policy "Anyone can read public open events" on public.favpolls rename to "Anyone can read public open favpolls";

commit;
