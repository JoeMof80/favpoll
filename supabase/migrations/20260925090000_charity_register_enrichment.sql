-- Three more things the Commission register says about a charity, stored
-- at approval and read by the Story engine and the family suggestion
-- (2026-09-25):
--   objects       charitygoverningdocument.charitable_objects — the legal
--                 purpose in the charity's own words; a second purpose
--                 source when `activities` is thin
--   areas         charityareaofoperation — [{area, type}], local authorities
--                 or countries; local vs national is the relevance axis
--   grant_making  charityoverview.grant_making_main_activity — the honest
--                 guard for "no cause family of its own"
ALTER TABLE charities ADD COLUMN IF NOT EXISTS objects text;
ALTER TABLE charities ADD COLUMN IF NOT EXISTS areas jsonb;
ALTER TABLE charities ADD COLUMN IF NOT EXISTS grant_making boolean;
