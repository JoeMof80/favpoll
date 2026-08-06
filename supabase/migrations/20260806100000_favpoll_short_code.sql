-- Short code for the guest QR. The guest URL is
-- https://favpoll.com/favpolls/<uuid> — 65 characters, 36 of them the UUID —
-- which at error-correction level H is a 49x49 QR. On the credit-card print
-- card that put each module at 0.313mm, under the ~0.4mm floor printed codes
-- need, so domestic printers' ink spread merged adjacent modules and the card
-- scanned only reluctantly (reported from a real print, 2026-08-06).
--
-- https://favpoll.com/p/<12 chars> is 34 characters -> 33x33, so every module
-- is 48% bigger at the same physical size, on every QR surface at once.
--
-- WHY 12 CHARACTERS. Measured: 4-character and 12-character codes both land on
-- 33x33 (the boundary is 34 characters of URL), so length here is FREE up to
-- 12 and there is no reason to use a short guessable one. Private favpolls are
-- auth-gated, but public-unlisted favpolls rely on URL obscurity today — a
-- 6-character code would make them enumerable. 12 hex chars is 2.8e14.
--
-- QR-ONLY (decision 2026-08-06). The short form is the QR target; the link an
-- organiser copies stays /favpolls/<uuid>. A random code is no more memorable
-- or typeable than a UUID, so it delivers no human benefit — that only arrives
-- with a MEANINGFUL slug (favpoll.com/p/belinda-hartley), which is separate
-- work. Keeping the code off the public face leaves that option open instead
-- of spending a favpoll's public identity on random hex.
--
-- Additive, never a replacement: /favpolls/<uuid> must keep working forever,
-- because cards are already printed and in the world.
ALTER TABLE favpolls
  ADD COLUMN short_code text NOT NULL
    DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);

-- Unique so the resolver can .single() on it, and so a collision surfaces as a
-- write error rather than two favpolls quietly sharing a URL.
CREATE UNIQUE INDEX favpolls_short_code_idx ON favpolls (short_code);
