-- THE FIELD THAT MAKES A CHARITY PAYABLE (2026-10-12)
--
-- favpoll collects AS AGENT for the charity under a written agreement, and
-- remits directly — no intermediary rail (founder, settled; the collection
-- agreement already says the charity will "keep its bank details and named
-- contact current"). Nothing in the product has ever collected them, so a
-- charity can be approved, agreed and still unpayable. This is that field.
--
-- WHY A SEPARATE TABLE, not columns on `charities`. The web app selects
-- `charities` everywhere — public pages, the picker, favpoll joins — and
-- those selects grow. A column here would eventually ride along on a query
-- somebody adds in six months. Nothing in apps/web reads this table at all;
-- RLS is enabled with NO POLICIES, so it is service-role only, like
-- model_spend and the register mirror.
--
-- WHY APPEND-ONLY. The threat is SUBSTITUTION, not disclosure: a sort code
-- and account number are printed on the bottom of every cheque, and plenty
-- of charities publish theirs for direct giving. What must never happen
-- quietly is someone changing them to divert a payout. So this table is
-- never UPDATEd — a change inserts a new row and the current account is the
-- latest. History is free, and a substitution is visible.
--
-- "LATEST" IS `seq`, NOT `created_at`. created_at defaults to now(), which
-- is TRANSACTION time: two rows written in one transaction carry the same
-- timestamp, the ordering ties, and the view can return the OLDER row as
-- current. Caught by testing this on staging before it went near a payout.
-- A bigserial is strictly increasing and settles it.
--
-- WHY PROVENANCE IS NOT OPTIONAL. `entered_by` and `source` record which
-- admin typed it and where it came from, so any row traces to a person and
-- a message.
--
-- A LESSON APPLIED. `verified_at` must only ever be set by a verification
-- that actually happened — a Confirmation of Payee result, a returned penny
-- test. It must never be stamped as a side effect of opening a form. The
-- column it is modelled against, consent_contacted_at, claimed an outcome
-- the system could not observe and was dropped this same day for exactly
-- that reason. Null means "nobody has checked", which is the honest default.

create table if not exists charity_bank_accounts (
  id            uuid primary key default gen_random_uuid(),
  charity_id    uuid not null references charities (id) on delete cascade,

  -- The name on the account, which is what Confirmation of Payee checks.
  -- Often NOT the charity's display name: "Comic Relief" banks as Charity
  -- Projects, and a hospice may bank as its trading subsidiary.
  account_name   text not null check (length(btrim(account_name)) > 0),
  sort_code      text not null check (sort_code ~ '^[0-9]{6}$'),
  account_number text not null check (account_number ~ '^[0-9]{8}$'),

  -- Provenance: who put it there and where it came from.
  entered_by text not null check (length(btrim(entered_by)) > 0),
  source     text,
  note       text,

  -- Verification, only ever written by a check that really ran.
  verified_at     timestamptz,
  verified_method text check (
    verified_method in ('confirmation_of_payee', 'penny_test', 'other')
  ),
  verified_by     text,

  -- Strictly increasing, and the only thing "current" is decided by.
  seq        bigserial not null,
  created_at timestamptz not null default now(),

  -- A method without a time, or a time without a method, is a half-recorded
  -- fact. Keep them together or keep neither.
  constraint charity_bank_accounts_verification_complete check (
    (verified_at is null and verified_method is null)
    or (verified_at is not null and verified_method is not null)
  )
);

create index if not exists charity_bank_accounts_current
  on charity_bank_accounts (charity_id, seq desc);

alter table charity_bank_accounts enable row level security;

comment on table charity_bank_accounts is
  'Bank details for remitting pledges to a charity favpoll collects for AS AGENT. APPEND-ONLY: never update a row, insert a new one — the current account is the latest by seq, and the history is how a substitution becomes visible. Service-role only (RLS on, no policies); nothing in apps/web reads it.';

comment on column charity_bank_accounts.account_name is
  'The name on the bank account, for Confirmation of Payee. Often not the display name: Comic Relief banks as Charity Projects.';

comment on column charity_bank_accounts.verified_at is
  'Set ONLY by a verification that actually ran (a Confirmation of Payee result, a returned penny test). Never stamp it as a side effect of opening a form — see the column consent_contacted_at, dropped 2026-10-12 for claiming an outcome the system could not observe. Null means nobody has checked.';

-- The current account per charity, which is all any caller wants.
create or replace view charity_bank_account_current as
select distinct on (charity_id)
  charity_id,
  id,
  account_name,
  sort_code,
  account_number,
  entered_by,
  source,
  verified_at,
  verified_method,
  created_at
from charity_bank_accounts
order by charity_id, seq desc;

comment on view charity_bank_account_current is
  'The latest bank account row per charity, by seq — NOT by created_at, which is transaction time and ties for rows written together. The table is append-only, so "current" is a read, never a flag.';
