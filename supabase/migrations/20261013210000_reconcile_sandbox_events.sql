-- 680 PAYMENTS THAT WERE NEVER MISSING (2026-10-13)
--
-- `reconcile-payments` has reported 680 unmatched PaymentIntents worth
-- £4,703.20 every hour since launch, describing them as
-- "charged-but-unrecorded payment(s) ... needing a manual refund or
-- recovery". They are nothing of the kind. They are SANDBOX events, written
-- into this production table by the sandbox webhook that was deleted on
-- 2026-09-15.
--
-- PROVEN, not assumed:
--
--   Every unmatched id belongs to Stripe account F29w5QLsoQ — all 680 of
--   them. The live account is Jz911X4FUz, which first appears on
--   2026-09-07, launch day.
--
--   Sampled ids spread across the whole range return `resource_missing`
--   against the LIVE secret key. The control matters more than the sample:
--   a known-real pledge from 7 September (pi_3UD4DsJz911X4FUz1URcDNLl)
--   resolves on the same key with livemode=true, amount=100, succeeded. So
--   the key can see live intents; it cannot see these.
--
--   The dates corroborate it exactly: 33 in July, 286 in August, 361 in
--   early September, and NOTHING after 7 September.
--
-- No money is missing. Nothing is charged-but-unrecorded. There is nothing
-- to refund or recover.
--
-- The rows are KEPT — they are the record of the sandbox era — and marked
-- reconciled so the hourly report goes quiet. That is the point: a report
-- that always says 680 is a report nobody reads, and the next REAL
-- charged-but-unrecorded payment has to be able to stand up and be seen.
--
-- `reconciled_kind` gains a third value. The column's documented vocabulary
-- was 'pledge' | 'pot_topup' with no CHECK constraint, so this could have
-- been written silently. Documenting it instead, because a column whose
-- values are undocumented is how `consent_contacted_at` came to mean
-- something nobody intended.

update stripe_payment_events
set reconciled_at   = now(),
    reconciled_kind = 'sandbox'
where reconciled_at is null
  and payment_intent_id like 'pi_%F29w5QLsoQ%';

comment on column stripe_payment_events.reconciled_kind is
  'What the event was matched against: ''pledge'' | ''pot_topup'' | ''sandbox''. The last is not a match — it marks an event from the pre-launch SANDBOX Stripe account (F29w5QLsoQ), written here by the sandbox webhook deleted 2026-09-15. Those 680 events were never real money and were never missing; they are marked reconciled so the hourly unmatched report can mean something again.';
