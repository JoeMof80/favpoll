-- THE BANNER: a wide image for a cause favpoll (founder, 2026-10-29/30).
--
-- The hero's one image slot is an 80px square, which assumes a face or a
-- mark. A cause favpoll's subject rarely is one — a hall, a band, a room —
-- so wide subjects were being cropped into a small square. See
-- references/hero-banner-2026-10-29.md.
--
-- Optional, and separate from photo_url on purpose: photo_url is the
-- square the hero hangs off the band and is mandatory since 2026-10-29;
-- this is the wide image above it, and a favpoll without one renders
-- exactly as it did before.
--
-- Text is NEVER drawn over it, so no veil or contrast value is stored
-- with it. That was tried and rejected: a veil tuned for one photograph
-- cannot be trusted on one nobody vetted.

alter table favpolls add column if not exists banner_url text;

comment on column favpolls.banner_url is
  'Optional wide image shown above the hero text on a cause favpoll. Never drawn behind text. Square hero photo is photo_url.';
