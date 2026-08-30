# PROTOTYPE — the extended creation wizard (2026-08-31)

**Question.** Should favpoll's creation flow be a full stepped wizard
(JustGiving's shape) instead of the wizard-then-in-place-dialogs flow —
and if so, one question per screen or one scrolling page of sections?

**Where.** `/prototype/wizard` (no auth — throwaway). `?variant=stepped`
(A, default) or `?variant=sections` (B); a floating bar switches. Real
charities and topics, the real `EventStep`/`CharityStep`/`TopicStep` as
step bodies, and the REAL live preview — `EditableHero` +
`EditablePollArea` + `CharityBanner` on a real `FavpollFormValues` form —
building and taking its register's colour as you answer. Publishing is
deliberately dead: the prototype answers "how does creating feel", not
"does the backend work".

**Delete together:** this directory. Nothing else was touched.

**Round 1 verdict (founder, 2026-08-31).** A — one question per screen —
with refinements, all in round 2: no Who step (who belongs to the Generate
control unless an example is generated); charity and topic keep their
DIALOGS; name, opening line, context, about and reveal share ONE step
("Their page") with a generate-example button; the reveal has an Include
switch that removes it from the live preview; the preview fades everything
except the region the step writes, to say "this is the favpoll page".
Variant B (one page of sections) eliminated.

**Open question (founder):** replace opening line + name + context with a
single JustGiving-style Title, and take a wide banner image? Assessed in
the session, not prototyped: the structured triple is load-bearing
(headline derivation, share titles, OG cards, keepsake split, the
"<name>'s favourite will be revealed" copy, protagonists as first-class
rows), so Title would be a modelling regression; the felt fussiness is
presentational and round 2 answers it by making Name primary and the rest
quiet. The banner image is a real, separate exploration.

**Verdict.** _(founder to fill in after round 2)_
