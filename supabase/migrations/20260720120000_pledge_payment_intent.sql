-- Server-side payment verification (2026-07-20): a card pledge must be tied
-- to the Stripe PaymentIntent that actually charged it. The pledge actions
-- retrieve the PI and verify status + amounts before recording; storing the
-- id makes each payment recordable exactly once (the partial unique index is
-- the replay/double-submit backstop). Fund pledges (shared-fund allocations)
-- carry no PaymentIntent — the column stays null for them.
alter table pledges add column if not exists payment_intent_id text;

create unique index if not exists pledges_payment_intent_id_key
  on pledges (payment_intent_id)
  where payment_intent_id is not null;
