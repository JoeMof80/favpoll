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

## Round 10 — the shape (2026-08-31)

Founder: the live preview is overkill; the wizard is mostly right already —
just add the extra steps. This round deletes the preview column entirely and
rebuilds the prototype as the PRODUCTION wizard's exact chrome (rail, step
shell, overlays, nav via useWizardState + the wizard components wholesale),
with four steps appended after Topic:

1. **Name** — name / opening line / context
2. **About & reveal** — with Generate an example and the Include switch
3. **Goal** — presets + custom, plus the shared-fund head start (the fund
   itself always exists; only the seed is optional)
4. **Publish** — Listed switch, close date, Publish (dead)

Single column, phone-friendly, the payoff is the real page after Publish.

## Round 11 (2026-08-31)

Founder: keep the triple (convinced — Name is an entity the whole product
recomposes; Opening line defaults by register; Context owns a slot). Three
changes: Opening line moves ABOVE Name — the page's own order; Goal merges
into Publish (six steps); bigger inputs (h-11, full text size).

## Generation design (founder, round 29 — for the real build)

The extended wizard makes the Generate dialog's questions obsolete: by
the Story step it already knows register, charity, topic, name and
context, so safeGenerateDraft takes those as calibration and the button
is one click, no dialog. Pronouns are never derived from the name
(misgendering risk, worst on memorials): generated copy is name-anchored
and they/them; the organiser edits freely. The Name label is dynamic —
"Name or cause" under Fundraiser, since Cause lives inside that register
in this wizard.

## VERDICT (founder, 2026-08-31, round 41)

**The extended wizard wins.** Forty-one rounds landed on: six steps
(Event · Charity · Topic · Info · Story · Details), single column, no
live preview — the payoff is the real page after Publish. Production
chrome throughout (useWizardState, wizard cards, overlays, photo crop,
calendar dropdown + presets, CharCounter, dialog helper copy). The who
axis lives on the Name field (icon dropdown, founder's icon set, never
inferred from the name) and calibrates one-click generation together
with register, charity, topic and context.

Founder: "i think I'm happy with this prototype. I'm strongly tempted
to use this for editing as well as adding a favpoll." — so the build
direction is create AND edit through this wizard (rail clickable,
prefilled, Publish→Save), the favpoll page becomes pure guest-view, and
the in-place edit system retires. Open design item: step locking for
live favpolls (Event/Charity/Topic lock once pledges exist).
