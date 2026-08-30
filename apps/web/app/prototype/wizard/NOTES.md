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

**Verdict.** _(founder to fill in)_
