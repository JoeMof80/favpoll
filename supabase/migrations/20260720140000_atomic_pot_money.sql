-- Atomic, verified shared-fund money movement (2026-07-20). Previously the
-- fund actions did read-modify-write increments on favpoll_pots (racy,
-- last-write-wins), the guest top-up was unauthenticated, and pledgeFromFund
-- trusted a client-supplied current-allocated figure. Now:
--
--  - pot_topups is a mini-ledger: every top-up records its amount and the
--    Stripe PaymentIntent that paid for it. The unique payment_intent_id
--    makes each payment creditable exactly once (replay-safe), and the
--    ledger makes total_deposited auditable. (Seed of the full transactions
--    ledger the disbursement rail will eventually force.)
--  - pot_top_up() inserts the ledger row and increments the pot in one
--    transaction, creating the pot if the favpoll doesn't have one yet.
--  - pot_allocate() is a guarded atomic increment — it refuses to allocate
--    more than the fund holds, so concurrent allocations can never oversell.
--  - pot_deallocate() releases a reservation (floor 0) if the pledge that
--    followed an allocation fails to record.
--
-- Service-role only; execute revoked from client roles.

create table if not exists pot_topups (
  id uuid primary key default gen_random_uuid(),
  pot_id uuid not null references favpoll_pots (id),
  amount numeric not null check (amount > 0),
  payment_intent_id text not null unique,
  clerk_user_id text,
  created_at timestamptz not null default now()
);

revoke all on table pot_topups from public, anon, authenticated;

create or replace function pot_top_up(
  p_favpoll_id uuid,
  p_amount numeric,
  p_payment_intent_id text,
  p_clerk_user_id text default null
) returns uuid
language plpgsql
as $$
declare
  v_pot_id uuid;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Top-up amount must be positive';
  end if;

  select id into v_pot_id from favpoll_pots where favpoll_id = p_favpoll_id;

  if v_pot_id is null then
    insert into favpoll_pots (favpoll_id, created_by, total_deposited, total_allocated)
    select f.id, f.created_by, 0, 0 from favpolls f where f.id = p_favpoll_id
    returning id into v_pot_id;
    if v_pot_id is null then
      raise exception 'Favpoll not found';
    end if;
  end if;

  -- Ledger first: the unique payment_intent_id aborts the whole transaction
  -- on a replay, so the pot is never double-credited.
  insert into pot_topups (pot_id, amount, payment_intent_id, clerk_user_id)
  values (v_pot_id, p_amount, p_payment_intent_id, p_clerk_user_id);

  update favpoll_pots
  set total_deposited = total_deposited + p_amount
  where id = v_pot_id;

  return v_pot_id;
end;
$$;

create or replace function pot_allocate(
  p_pot_id uuid,
  p_amount numeric
) returns uuid
language sql
as $$
  update favpoll_pots
  set total_allocated = total_allocated + p_amount
  where id = p_pot_id
    and p_amount > 0
    and total_deposited - total_allocated >= p_amount
  returning id;
$$;

create or replace function pot_deallocate(
  p_pot_id uuid,
  p_amount numeric
) returns uuid
language sql
as $$
  update favpoll_pots
  set total_allocated = greatest(total_allocated - p_amount, 0)
  where id = p_pot_id
    and p_amount > 0
  returning id;
$$;

revoke execute on function pot_top_up(uuid, numeric, text, text) from public, anon, authenticated;
revoke execute on function pot_allocate(uuid, numeric) from public, anon, authenticated;
revoke execute on function pot_deallocate(uuid, numeric) from public, anon, authenticated;
