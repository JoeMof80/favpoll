-- Admin-curated impact line shown at pledge time ("£20 funds an hour of
-- nursing care"). One short statement per charity; null = none.
ALTER TABLE charities ADD COLUMN impact_statement text;
