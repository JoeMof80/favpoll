-- Disbursement ledger: one row per (favpoll, charity) payout attempt, written
-- when a favpoll closes. A favpoll splits its raised total equally across its
-- (at most 3) charities. Amounts are in pounds, matching favpolls.total_raised
-- and pledges.total_amount (pence only appears at payment-provider boundaries).
--
-- Written by the close-favpolls cron via the service role only. Idempotent:
-- the cron only disburses a favpoll while closing it (closed_at was null), and
-- the unique (favpoll_id, charity_id) is a backstop against double payout.
--
-- 'provider' records which rail moved the money. Until a real provider (e.g.
-- Goodstack, pending onboarding) is wired in, the NoopProvider records intent
-- with status 'pending' — nothing has actually reached a charity yet.
create table disbursements (
  id uuid primary key default gen_random_uuid(),
  favpoll_id uuid not null references favpolls(id) on delete cascade,
  charity_id uuid not null references charities(id),
  amount numeric not null check (amount >= 0),
  provider text not null,
  provider_ref text,
  status text not null
    check (status in ('pending', 'sent', 'unpayable', 'failed')),
  reason text,
  created_at timestamptz not null default now(),
  unique (favpoll_id, charity_id)
);

create index disbursements_favpoll_id_idx on disbursements (favpoll_id);
create index disbursements_charity_id_idx on disbursements (charity_id);

-- Service-role only — never exposed to clients.
revoke all on table disbursements from public, anon, authenticated;
