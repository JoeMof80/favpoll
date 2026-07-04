-- Optional guest contribution to favpoll (pounds), collected with the
-- pledge charge but never part of charity money: total_amount stays
-- charity-only and feeds total_raised / the record as before.
ALTER TABLE pledges
  ADD COLUMN tip_amount numeric NOT NULL DEFAULT 0
  CHECK (tip_amount >= 0);
