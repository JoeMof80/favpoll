# Outreach notes — advancing favpoll

_Compiled 2026-07-31 from working session discussion._

## Joy's response (celebrant, 2026-07-31)

Her words, condensed: enjoyed it; "my first thought was at a wake, where
people are seated together — you'd create a brilliant atmosphere. The
questions alone will encourage discussions and hilarity. It gets around the
problem with a no cash society." Asked whether questions are computer
generated or family-preset ("the latter could get awkward!"). Sees endless
possibilities (birthdays, engagements, weddings); marketing thoughts are ads
/ flyers / word of mouth; "will ask around, see what people think."

### What's signal

- **She independently found the wake-table moment.** Nobody pitched her the
  communal live mechanic — she reconstructed it from playing. The memorial
  use case isn't donations-with-extra-steps; it's something for the room to
  do together. And it locates the moment precisely: the **wake**, not the
  service — QR codes on tables, live display in view.
- **She handed us a pitch line.** "It gets around the problem with a no cash
  society" — the retiring-collection replacement in a gatekeeper's own words.
  Use verbatim with funeral directors and with Angela Slack.
- **Her one worry → a product item.** Factual answer: the family picks ONE
  topic from a curated list; the AI only drafts example copy; no free-form
  question-writing. But the instinct is right — not every topic suits a
  memorial, and a grieving organiser has no spare judgement. A
  memorial-aware topic shortlist (suggestions filtered/ordered by register)
  answers it structurally. Small build, field-requested.
- **The meta-signal beats the marketing ideas.** "Will ask around" is Joy
  volunteering as the network node — the celebrant channel activating
  itself. Follow-up: give her an artefact to carry (a shareable
  memorial-register demo favpoll) plus answers to the questions she'll get.
- Minor: she says "questions" plural — her mental model expects several per
  event. The schema supports multi-poll; the UI does one. A data point if
  multi-poll resurfaces.

### Follow-ups

1. Reply answering the generated-vs-preset question (curated topics, one per
   favpoll, examples AI-drafted but organiser-owned).
2. Build/share a memorial demo favpoll she can forward when she asks around.
3. Product list: register-aware topic suggestions for memorials.

### Suspected misreads (2026-08-01) — each one a clarity gap of ours

In increasing order of importance:

1. **"Questions", plural — quiz-night mental model.** A favpoll is ONE
   topic; nothing on the marketing surfaces establishes the shape ("one
   occasion, one question"). Mild alone, but feeds №3.
2. **Provenance confusion — who authors what.** She likely saw "Generate an
   example" produce copy and came away unsure whether content is
   machine-made or family-made. The real model (family picks one curated
   topic; examples are drafts the family owns and edits) is invisible — we
   now ENFORCE "the example is never the product" (submit guard) without
   ever SAYING it in the create flow.
3. **The serious one: she may think guests answer questions ABOUT the
   deceased.** Her awkwardness worry is odd if guests merely state their own
   favourite — and completely rational if she believes the mechanic is
   "guess Bob's favourite" (getting it wrong at a funeral is excruciating).
   This is the exact guessing misread the copy rules already fight on the
   guest side. If Joy can hold it after playing with the product, the
   pick-your-own / theirs-revealed-after mechanic isn't landing as fast as
   assumed. **Probe: ask her to describe, in her own words, what a guest at
   the wake actually does.** Cheapest user research available.
4. **She doesn't see herself as the channel.** Her marketing instincts are
   all mass-consumer (ads, flyers, emails) — "a celebrant suggests it to a
   family" hasn't occurred to her as the distribution, because no
   professional-facing framing exists anywhere.

### Clarity fixes, in value order

1. One line of guest-page mechanic at the hero level — the generated About
   now carries "pick your own favourite… and hers will be revealed", but the
   hero itself states no mechanic at all.
2. One provenance sentence in the create flow near Generate ("examples are
   starting points — everything published is yours").
3. Eventually: a small "for celebrants and organisers" page the Joys can
   forward — which also answers misread №4.

---

## The presence dial (founder concept, 2026-08-01)

favpoll's intensity at an event is a **dial, not a setting** — and we have
never told anyone it has one. The misread risk isn't that favpoll is
imposing; it's that nobody knows it can be quiet. Three postures, mapping
loosely to register:

| Posture | Register home | What it looks like in the room |
| --- | --- | --- |
| **Ambient** | Memorial (wake) | QR cards on tables, one gentle mention from the celebrant, screen in a corner at most. The occasion stays about the person. |
| **Moment** | Celebration | Party runs with favpoll in the background, then a beat — "let's see what she picked" — and it recedes again. |
| **Rally** | Cause / fundraiser | Telethon-style: the room watches the total edge toward the goal; the screen IS the event; an MC milks it. |

### Product implications (future)

- The live display is one-style-fits-all today — the memorial wake gets the
  same screen energy as the quiz night. A quiet variant (no goal bar, slower
  rhythm, name-forward) vs a rally variant (goal thermometer as the hero,
  big total) is a real build.
- The rally end wants the goal bar to be the display's protagonist, which it
  currently isn't.
- The "moment" posture hints at organiser-triggered choreography (a live
  reveal beat) — parked, but noted.

### Register-specific landing pages

Yes — same idea wearing marketing clothes. Each page is the presence dial
shown at the right setting: `/memorials` whispers, `/fundraisers` rallies,
`/celebrations` sits between. Each is the forwarding artefact its gatekeeper
needs (Joy forwards the memorial page; Angela Slack gets the fundraiser one;
venue coordinators the celebration one) — and it answers the "she doesn't
see herself as the channel" gap.

**Sequencing: build ONE first — memorial** — the channel is already warm
(Joy asking around now, funeral directors and St Luke's next). Learn from
it, then template the other two. Three at once triples the copywriting for
zero extra learning.

---

## Hospice ethics — how the family channel actually works (2026-08-01)

Angela's scope is NOT only fundraisers — community partnerships typically
includes in-memory giving. But the family channel is **a menu item, never a
pitch**:

- Hospices already run carefully-managed in-memory programmes with a hard
  ethical line: the clinical/family-support side never raises money, and
  nobody approaches a family pre-bereavement. "Soon to lose a loved one" is
  a door you don't knock on — suggesting it would mark us as not
  understanding their world.
- The correct shape: families ALREADY come to the hospice (usually via the
  funeral director) saying "we'd like donations to St Luke's — how?" The
  hospice answers with its in-memory menu (tribute fund, collection
  envelopes, JustGiving in-mem page). **The ask to Angela: add favpoll to
  that menu** — a line in the bereavement aftercare materials, an option the
  funeral director can hand over. The hospice never initiates; the family
  already asked.
- Funeral director = front door; hospice = endorsement behind it.
- On the call: ask Angela who owns in-memory giving specifically — many
  hospices have a dedicated In-Memory Officer; if St Luke's does, that's
  the person, with Angela as introducer.

## The reveal question (founder realisation, 2026-08-01)

Joy's guessing misread traces to the reveal mechanism: "pledge, and then
her favourite will be revealed" implies the pledge was a guess at it — and
"reveal" itself is quiz-show vocabulary (reveals are what answers get).
Founder floated: make the reveal optional, remove it, or reveal upfront in
the About. Resolution reached:

- **It's already optional structurally** — schema-optional, and the guest
  page skips the reveal section cleanly when absent. Loose end found: the
  generated About promises "…and hers will be revealed", and an organiser
  can clear the reveal yet publish the promise (the submit guard catches an
  UNEDITED reveal, not an EMPTY one). Fix: no reveal → About must not
  promise one.
- **Not upfront** — anchoring corrupts the standings (guests conform to the
  protagonist's pick), and it deletes the post-pledge moment.
- **Not removed** — the "everyone knows Grandad's breed" objection reveals
  what the feature actually is: the value was never secrecy, it's the
  SENTENCE ("His was the Labrador. He never walked past one without
  stopping"). Everyone knows the breed; nobody has the detail. **The reveal
  is a keepsake, not an answer key** — intrigue is a bonus, warmth is the
  constant. Also one of the un-DIY-able seconds (the gated gift is what
  Mentimeter+JustGiving can't do).
- **Direction: reframe, don't remove.** Promise copy shifts gift-ward
  ("…and you'll get to see hers — and why"); post-pledge presentation leans
  into the detail rather than the unveiling; the mechanic line ("guests
  pick their OWN favourite") does the rest. Renaming the word "reveal"
  across the UI is a bigger brand question — test softer promise copy
  first; Joy's network will say whether the misread persists.

## The borrow-the-idea risk (2026-08-01)

Honest assessment: the surface is copyable; the core loop isn't. A
fundraiser can DIY "a poll and a donation link" (Mentimeter + JustGiving +
a bucket). They cannot DIY **the pledge IS the vote** — standings weighted
by real money require taking payment per answer, reconciled per favourite,
with the reveal gated behind the charge. Rebuilding that isn't borrowing
the idea; it's rebuilding the product.

Practical defences:

1. **Demo the un-DIY-able seconds** — tap → pay → reveal in ten seconds, and
   the standings moving BECAUSE money moved. Never demo it as "a poll for
   your event" (that sentence is an instruction manual for copying).
2. **Price removes the motive** — at 0% fee, DIY saves nothing and costs
   effort, reconciliation, Gift Aid admin and refund liability. "Less work
   than the bucket" is the moat for PTAs and hospices, none of whom build
   software.
3. **Segment accordingly** — the copy-capable audience is big national
   charities with product teams; the warm segment (hospices, clubs, PTAs,
   celebrants) has zero build capacity. Go deep where copying is impossible
   in practice; treat eventual imitation from the big end as category
   validation, met with the record, accounts and repeat organisers they'd
   start without.

## Who to talk to next

Think of it less as "who has opinions about events" and more as **who hands
the organiser their checklist** — the gatekeepers standing next to someone at
the exact moment they're deciding how an occasion will work.

### Memorial (strongest fit; Joy already engaged)

- **Funeral directors** — the single highest-leverage conversation.
  "Donations in lieu of flowers" already flows through them; they hand
  grieving families the practical arrangements list, and favpoll is a direct
  upgrade to the retiring-collection-and-JustGiving-link they currently
  suggest. One local independent firm trialling it beats ten opinions.
- **More celebrants** — Joy is one data point. The Fellowship of Professional
  Celebrants and Humanists UK celebrant networks are dense communities where
  one enthusiast presents to fifty peers.

### Celebration

- **Venue and wedding coordinators** over independent planners, if forced to
  pick — planners run dozens of events a year, but coordinators touch every
  event at their venue and are always looking for things that make receptions
  feel alive. The live display is the demo weapon here.
- **Independent event planners** still matter as a multiplier, but they're
  intermediaries — their question is "does this make _me_ look good to my
  client", so pitch the live standings moment, not the charity rail.

### Cause

- **Community fundraising managers at hospices** — the sweet spot: local,
  relationship-driven, already deep in in-memoriam giving, and small enough
  organisationally that one manager can just say yes. They'd hand favpoll to
  bereaved families themselves — collapsing two registers into one channel.
- **School PTA chairs and sports club secretaries** — the occasion catalogue
  (quiz nights, testimonials, kit funds) is practically their calendar.

### Two practical notes

1. **Change the ask.** "Give me feedback" gets politeness; "can we run it at
   one real event of yours" gets truth — and the product can survive that ask
   now.
2. **Gatekeepers convert on seeing money move at a live event.** One
   completed real occasion, however small, becomes the artefact you show
   everyone else.

---

## How JustGiving established themselves

A useful case study — their wedge was narrower than people remember.

- **Founding.** Zarine Kharas and Anne-Marie Huby, London, launched 2001
  (founded 2000). The timing was the masterstroke: the Finance Act 2000 had
  just reformed Gift Aid (scrapping the minimum-donation threshold), and
  JustGiving built automated Gift Aid reclaim in from day one. For charities
  that alone was the pitch — paper Gift Aid admin was miserable, and
  JustGiving turned it into a checkbox worth an automatic 25% uplift.
- **The wedge: replacing the paper sponsorship form.** Not "online donations"
  in general — one specific existing behaviour (sponsoring a London Marathon
  runner) where the incumbent was a crumpled form and months of chasing cash.
  Every runner who made a page broadcast it to their whole social circle;
  every donor saw the product working at the moment of giving. **The
  fundraiser was the distribution channel.**
- **Charities as the gatekeeper.** They sold to charities (subscription plus
  ~5% of donations), and charities pushed JustGiving to their event
  participants because it solved the charities' own problems: Gift Aid admin,
  cash handling, chasing pledges. Runners adopted it because their charity
  told them to. Donors never had to be acquired at all.
- **Then patience, then moments.** Roughly four years to break even. The
  step-changes were viral moments: the 2004 tsunami response, Jane
  Tomlinson's campaigns, Stephen Sutton (~£5m, 2014), Captain Tom (~£39m,
  2020) — each a national event that taught a cohort of the public the
  product exists. Blackbaud bought them in 2017 for around £95m.

### What transfers to favpoll

They won by attaching to an **occasion already happening** with a gatekeeper
who **already handed out the mechanism** — the funeral-director / celebrant /
hospice logic. favpoll's equivalent of the paper sponsorship form is the
retiring collection and "donations in lieu of flowers"; the equivalent of
Gift Aid automation is the reveal + live standings (the thing the incumbent
flow simply cannot do), with Gift Aid via Goodstack as the parity feature.
The sobering half: JustGiving's organiser acquisition was outsourced to
charities with marathon-sized participant lists, and they still needed years
— so **one warm channel worked deep beats five worked shallow**.

---

## St Luke's Hospice (Cheshire) — first approach

From slhospice.co.uk/contact:

| Contact | Role | Details |
| --- | --- | --- |
| **Angela Slack** | Community Partnerships Manager | 01606 555 697 · angela.slack@slhospice.co.uk |
| **Debra Sloan** | Events Fundraiser | 01606 555 685 · events@slhospice.co.uk |
| Daniel Harrison | Corporate Fundraising Officer | daniel.harrison@slhospice.co.uk |

**Aim one seat over from Debra.** She's the Events Fundraiser — her world is
the hospice's own event calendar, so favpoll becomes a tool she has to run at
her events (added workload). **Angela Slack** more likely owns what favpoll
actually is: supporter-led fundraising — other people raising money _for_ the
hospice at their own occasions — and typically the in-memoriam giving
relationships. Her job is measured on new community fundraising channels, so
a 0%-fee tool families run themselves is a pitch _to_ her objectives, not an
ask of her time.

### The approach

- **Lead with in-memory giving**, not the product category. "Families choose
  St Luke's for donations in lieu of flowers — this gives them something
  warmer than a donation link, at no fee" is a sentence she already has a
  budget line for.
- **Ask for one real occasion**, not a meeting about the concept — a family
  the hospice is already supporting, or one of Debra's smaller events as
  neutral ground. The completed favpoll becomes the artefact for every other
  hospice.
- **Have a demo favpoll ready on the phone** before any call — live standings
  and the reveal do the convincing. Check St Luke's is in the charities table
  first so the demo shows their name receiving the pledges.
- **Debra is the natural second conversation** — "Angela suggested I speak to
  you" beats cold-contacting both at once.
- Diligence: confirm St Luke's registered charity number (site footer) before
  adding them — the hero displays it.
