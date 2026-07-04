-- Optional pledge goal per favpoll (in pounds, same unit as total_raised).
-- Shown as an understated progress bar on the favpoll page and live display.
ALTER TABLE favpolls
  ADD COLUMN goal_amount numeric
  CHECK (goal_amount IS NULL OR goal_amount > 0);
