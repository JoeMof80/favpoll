-- Payment reconciliation (2026-07-21). Server-side verification (#301/#303)
-- stops fabricated records, but a client that dies after confirmPayment and
-- before savePledge leaves a CHARGED payment with nothing recorded — and
-- until now nothing noticed. The Stripe webhook records every succeeded
-- PaymentIntent here; the reconcile-payments cron marks each one off
-- against pledges / pot_topups and reports any still unmatched after a
-- grace period. Unmatched = charged-but-unrecorded → manual refund or
-- recovery, but never silent.
-- Service-role only.

create table if not exists stripe_payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id text not null unique,
  amount_pence integer not null,
  currency text not null,
  metadata jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  reconciled_at timestamptz,
  reconciled_kind text -- 'pledge' | 'pot_topup'
);

revoke all on table stripe_payment_events from public, anon, authenticated;
