-- Guest book display choice (founder, 2026-09-21): fundraiser events can
-- optionally show donation amounts in the guest book. A row shows EITHER
-- the backed favourites OR the amount, never both — showing both would
-- anchor amounts and bias the poll.
--
-- show_guest_amounts: organiser toggle, off by default.
-- guest_book_display: guest's per-pledge choice of what to show.

ALTER TABLE public.favpolls
  ADD COLUMN IF NOT EXISTS show_guest_amounts boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.favpolls.show_guest_amounts IS
  'Organiser setting: allow guests to show their donation amount in the guest book instead of their pick. Off by default.';

ALTER TABLE public.pledges
  ADD COLUMN IF NOT EXISTS guest_book_display text NOT NULL DEFAULT 'pick';

ALTER TABLE public.pledges
  ADD CONSTRAINT pledges_guest_book_display_check
  CHECK (guest_book_display IN ('pick', 'amount', 'none'));

COMMENT ON COLUMN public.pledges.guest_book_display IS
  'What appears in the guest book beside the name: pick (backed favourites), amount (£ figure), or none (anonymous presence only). is_anonymous controls the name; this controls the detail.';
