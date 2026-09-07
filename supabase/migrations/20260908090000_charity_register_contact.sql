-- Register-sourced contact details (2026-09-08): the Commission's
-- allcharitydetails endpoint returns the charity's public enquiries email
-- and website. The email prefills the consent-invite mailto on the manage
-- hub; the website is kept for a possible logo-suggestion flow. Both are
-- editable facts about outreach, not identity — nullable, no constraints.
alter table charities
  add column if not exists registered_email text,
  add column if not exists registered_website text;
