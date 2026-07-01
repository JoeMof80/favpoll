-- Add pronoun column to protagonists for generator fidelity.
-- Nullable: existing rows stay null → generator omits pronoun hint (same as today).
ALTER TABLE protagonists
  ADD COLUMN pronoun text CHECK (pronoun IN ('he', 'she', 'they'));

-- Cache key format changes with this release (pronoun segment appended).
-- Existing entries in generated_drafts are no longer reachable via the new key
-- format, so truncate to avoid serving stale pronoun-unaware copy.
TRUNCATE generated_drafts;
