# The pairing table — DRAFT for founder review

**23rd September 2026.** A lookup that makes generated favpolls *motivated by
construction*, so the generator never produces an arbitrary topic and the
quality score becomes a small rubric rather than a judgement engine.

Grounded in the live vocabulary: the 140 active topics and the 32 active
charities on prod as of today. Every topic and charity named here exists.

---

## How it is used

A favpoll is **motivated** when a guest can see why this topic, before pledging.
Four sources exist (see `linkedin-feedback-concept-clarity-2026-09-23.md`):

| Source | Tabled here? | Why |
|---|---|---|
| **Occasion** — retirement → Place | yes, §1 | a property of the occasion type |
| **Cause** — Dogs Trust → Dog breed | yes, §2 | a property of the charity |
| **Theme** — dinosaur party → Dinosaur | yes, §3 | a property of the party |
| **Known fact** — she just got guinea pigs | **no** | a property of one person; it lives in the Story (About + personal note) |

### The triangle (founder, 2026-09-23)

Synergy is not a couplet. Map the brand triad onto a favpoll — **Honour** is
the occasion, **Love** is the topic (the favourite: a piece of what someone
cares about), **Charity** is the recipient — and there are **three edges**:

```
                HONOUR (occasion)
                 /            \
     §1 occasion → topic    §2b occasion ↔ charity
               /                  \
     LOVE (topic) —— §2 charity → topic —— CHARITY
```

| Edges | What it is | Example |
|---|---|---|
| 3 | **a triad — the true exemplar**, the centre of the Venn | Ben's Channel Swim · Seaside town · RNLI |
| 2 | a good favpoll | Emma & James · Song · Shelter (wedding→song, wedding↔a home) |
| 1 | a couplet — motivated, but thin | David Clarke · Place · BHF (E1′ only — the About supplies "now he has time"; the occasion alone doesn't) |
| 0 | arbitrary | Joan & Arthur · Seaside town · Alzheimer's Society |

**The rule for generation:** start from a triple (occasion · charity · topic)
and count its edges against §1, §2 and §2b. Aim for three; seed at two or
more; never seed one or zero. A favpoll built this way was motivated before a
word of copy was written.

**Cause favpolls cannot be triads.** No protagonist means no Honour vertex —
the brand doc's own rule, "honour when there is someone to carry it". Their
ceiling is charity→topic plus a real event (bake sale → Cake). That is the
shape of the register, not a failure.

**Known fact is the escape hatch, not a fourth column.** Any topic can be
motivated by a fact about the person. The fact lives in the **Story** — the
About and the personal note together — and the two halves do different jobs:
the About carries it *before* the pledge ("her home was full of deliberate
colour"), which is what makes it motivation; the note carries it *after*
("Cornflower blue. She kept a pot on the windowsill"), which is the payoff. A
fact that appears only in the note is a payoff with no motivation in front of
it — the Yvette case. The generator may use the escape hatch; the rubric checks
the About half is actually there.

### Marks — and the constituent test (founder challenge, 2026-09-23)

- **★** — the topic is something that **happens at** the occasion: the first
  dance, the cake, the funeral flowers, the ring. One hop. It reads on the
  card with nothing else.
- no mark — the occasion **suggests** the topic (retirement → time → travel →
  place). Two hops. Motivated, but the About must say the hop, or a cold
  reader won't make it.

> The trap that produced the first draft's over-marking: I had read the
> exemplar Abouts. "He has a shortlist of places he never had time for" is
> the About supplying the link — that is E1′, a known fact, not E1. Score the
> occasion alone, as a guest sees the card.

---

## 1. Occasion → topics

### remembering

| Occasion | Topics |
|---|---|
| Memorial · Celebration of life · Tribute | Flower ★ · Hymn ★ · Poem ★ · Song · Saying · Season · Garden to visit |
| Pet memorial | Dog breed ★ · Cat breed ★ · Animal ★ · Weather for walk · Beach · Toy |
| In memoriam appeal | as Memorial, plus the charity's row in §2 |

> Memorials are the natural home of **known-fact** motivation (Belinda loved
> colour). The occasion pairings above are the service itself — flowers, hymns,
> readings. Everything else in a memorial should come from the person.

### celebrating_one

| Occasion | Topics |
|---|---|
| Birthday | Cake ★ · Biscuit · Sweet · Ice cream flavour · Pudding · Board game · Card game · Song |
| Milestone birthday | Decade ★ (the one they were born in) · Music era ★ · Song · Film · TV theme tune · Sweet · Toy |
| Retirement | Place · Type of holiday · Way to spend Sunday · Garden to visit · Hobby · Way to travel — **all two hops ("now there's time")**. Little *happens* at a retirement that maps to a topic; like a memorial, the **person** motivates it. Lean on E1′ |
| Leaving do | Beer · Takeaway (the leaving drinks) · Coffee order · Sandwich (office life — two hops) · City (where they're going) · Saying |
| Graduation | School subject ★ · Book · Author · Type of book · City (where next) · Takeaway |
| Christening · New baby · Baby shower | Children's book ★ · Nursery rhyme ★ · Name for a grandparent ★ · Fairy tale · Toy · Cartoon · Childhood game · Season |
| Bar or bat mitzvah | Song · Film · Book · Sweet · Board game — *see review note A* |
| Recovery | Form of exercise · Weather for walk · Landscape · Comfort food · Song · Way to spend Sunday · Season · Time of day — *two hops ("back on their feet"); the About says it* |
| New job · Promotion | Cocktail · Beer · Wine · Takeaway (the celebration) · Coffee order · Sandwich · City — *thin; lean on E1′* |
| Achievement (sporting) | **where it happened** ★ — Seaside town (a swim) · National park · Landscape · Beach · Mountain or peak · River · Comfort food · Song (the training playlist — two hops) · Form of exercise · Weather · Sporting moment |
| Award | Saying · Word · Book · Poem · School subject · Instrument — *depends on the award; see note B* |
| Exam success | School subject ★ · Way to spend Sunday · Takeaway · Sweet · Book |
| New home | Part of a roast dinner (the housewarming dinner) · Board game · Way to spend Sunday · Flower · Tree · Landmark or building · County · City · Smell — *two hops ("settling in")* |
| Citizenship | Type of tea ★ · Weather ★ · Biscuit · Sandwich · Word · Regional or dialect word · Saying · TV programme · Football team · Seaside town · Cuisine |
| Coming out | Song · Musical · Band or artist · Film · Decade — *see note C* |
| Divorce party | Cocktail ★ (it's a party) · Wine · Spirit · Song · Type of holiday (the first solo trip) · Way to spend Sunday |
| Just because | **no occasion pairing** — known fact only |

### celebrating_many

| Occasion | Topics |
|---|---|
| Wedding | Song ★ (first dance) · Cake ★ · Flower ★ · Cocktail · Dance · Poem · Type of holiday · Island · Beach · Country · Place (the venue) |
| Engagement | Gemstone ★ (the ring) · Song · Cocktail · Wine · Type of holiday · Island · Beach · Flower · Place (where it happened) |
| Anniversary | Song ★ (their song) · Decade ★ (the year they married) · Music era · Film · Gemstone (the year's gift) · Cuisine · Wine · Type of holiday · Dance |
| Renewal of vows | as Wedding, plus Decade |
| Reunion | Decade ★ · Music era ★ · Song · School subject · Childhood game · Sweet · Crisps · TV theme tune · Sitcom · Cartoon · Toy · Video game |
| Team celebration (sport) | Sporting moment ★ · Sport to play · Sport to watch · Football team · Rugby team · Cricket team · Beer · Takeaway |
| Team celebration (work) | Takeaway · Beer (the team meal) · Biscuit · Coffee order · Sandwich — *office life is two hops* |
| Family gathering | Part of a roast dinner ★ · Name for a grandparent ★ · Board game ★ · Card game · Pudding · Pie · Way to spend Sunday · Nursery rhyme · Childhood game |
| Family gathering (Christmas) | Christmas tradition ★ · Christmas film ★ · Christmas song ★ · Carol ★ · plus the row above |

### cause

| Occasion | Topics |
|---|---|
| Fundraiser | **the charity's row in §2 first** · then the event: Cake · Biscuit · Pie (bake sale) · Cocktail · Wine (a do) · Card game (casino night) · Film (film night) · Song · Dance |
| Sponsored event | as Achievement (sporting), plus the charity's row |
| Charity night | Cocktail ★ · Wine · Song · Dance · Card game · Film · Comedian (comedy night) · Musical · Cake |

---

## 2. Cause → topics

### The key is the cause family, not the charity (founder, 2026-09-23)

> "The wizard allows the organiser to select any charity. Will we always be
> able to infer what the charity is for?"

No — not from what we store. The wizard opens the whole Charity Commission
register, and a charity added that way arrives with **no description** — seven
on prod already have none (Rescue Kitties, Nature Warriors, both hospices, MAC
Bevan, St LUKE Charlton, British School). The generator's sole cause signal
today is `description`, so for those seven the prompt carries a name and
nothing else — and the model guesses what "MAC Bevan Charitable Trust" does.

**But the register does publish purpose, and we can already reach it**
(verified against the live API, 2026-09-23):

| Endpoint | Called today? | Purpose data |
|---|---|---|
| `searchCharityName` | yes | none — identity only |
| `allcharitydetails` | yes | **`who_what_where`** — What/Who/How classification codes. We type two fields off this payload and drop the rest |
| `charityoverview` | no | **`activities`** — the charity's own free-text description |

Examples from prod's register-added charities:

| Charity | What | Who | `activities` |
|---|---|---|---|
| Rescue Kitties | Animals | — | "a feral, stray and at-risk cat charity… Greater Manchester" |
| Nature Warriors | Amateur sport · Other | Children/young people | "recreational activities… using the outdoors, nature" |
| St Luke's Cheshire Hospice | — | — | "In-care, day-care, therapies… palliative care" (raw, unformatted) |
| MAC Bevan Charitable Trust | **General Charitable Purposes** · Education · Health · Poverty | Children · Elderly · Disabled | "offers grants and financial support to small… organisations" |

**Correction after the staging backfill (2026-09-23, 34 charities):** the
`What` codes are far noisier than three samples suggested. "General
Charitable Purposes" and "Education/training" sit on NSPCC, Hospice UK, the
Children's Society, Comic Relief and St Mungo's alike — Hospice UK's
classification says nothing about hospices. `What` alone cannot suggest a
family. It still **refuses** cleanly (MAC Bevan: four Whats, no cause), so
it works as a *guard* against inventing a family for a grant-maker, not as
the source of one. The suggestion has to come from `activities` + `Who`,
which means one cheap model call per charity at approval time (Haiku over
name + activities), with the classification as the sanity check.

`activities` is the charity's own words, so the generator is *told* purpose
rather than inferring it — but it is raw (run-together sentences, bulleted
lists). A source for the prompt, never copy to display.

So §2 and §2b key on a **cause family** — roughly ten cover the register:

| Family | Seeded members |
|---|---|
| animals | Dogs Trust · RSPCA · WWF |
| children | NSPCC · Barnardos · Children's Society · Save the Children |
| older people | Age UK |
| end-of-life · dementia | Marie Curie · Hospice UK · St Richard's Hospice · Macmillan · Alzheimer's Society |
| a health condition | Cancer Research UK · British Heart Foundation · Stroke Association · Diabetes UK · RNIB · Scope |
| mental health | Mind · Samaritans |
| homelessness | Shelter · Crisis · St Mungo's |
| food poverty | Trussell Trust |
| environment · heritage | National Trust · WWF |
| sea · rescue | RNLI |
| international | Oxfam · Médecins Sans Frontières · Save the Children |
| entertainment-led | Comic Relief |

The rows below are written per charity for readability; each is really its
family's row, and a new charity inherits it the moment it has a family.

**Rules for the family:**

- **Set at approval, never inferred at generation time.** When a charity is
  added from the register: read `who_what_where` from the `allcharitydetails`
  payload we already fetch, make one extra call to `charityoverview` for
  `activities`, store both on the row, and map What/Who codes → a suggested
  family. The admin outreach queue (#869) already reviews every register-added
  charity before it goes active — the admin confirms or clears the suggestion
  there. Cached forever; the generator reads columns.
- **Unknown family = no edge, not a guess.** E2 and E3 are absent; the Story
  leans on E1 and E1′. That is the seed-bar logic already, not a special case.
- **The generator's purpose signal is `activities` (or `description`), and
  when both are absent it names the charity and does not characterise its
  work.** It must never invent what a charity is for. This is a truthfulness
  rule, not a style one.

Inactive charities omitted. Grouped where the cause is the same.

| Charity | Topics |
|---|---|
| Dogs Trust | Dog breed ★★ · Animal · Weather for walk · Beach |
| RSPCA | Animal ★ · Dog breed · Cat breed · Bird · Butterfly · Insect |
| WWF | Animal ★ · Sea creature · Bird · Butterfly · Tree · Landscape · Island · National park · River · Mountain or peak · Planet |
| National Trust | Castle ★ · Garden to visit ★ · Landmark or building · National park · Tree · Landscape · Beach · Weather for walk · Season · Famous painting |
| RNLI | Seaside town ★ · Beach ★ · Sea creature · Island · Weather · Way to travel |
| Trussell Trust | Part of a roast dinner ★ · Comfort food ★ · Meal of the day · Breakfast cereal · Sandwich · Pie · Type of tea |
| Shelter · Crisis · St Mungo's | Comfort food ★ · Way to spend Sunday · Meal of the day · Smell (of home) · Sound · Season — *the topics of "home"; see note D* |
| NSPCC · Barnardos · Children's Society · Save the Children | Children's book ★ · Toy ★ · Fairy tale · Nursery rhyme · Cartoon · Childhood game · Sweet · Ice cream flavour · Dinosaur · Superhero · Planet · Comic or annual |
| Comic Relief | Comedian ★ · Sitcom ★ · TV programme · Saying · Song |
| Alzheimer's Society | Song ★ (music is the last thing to go) · Music era · Decade · Smell · Saying · TV theme tune · Hymn · Childhood game · Sweet |
| Age UK | Decade · Music era · Way to spend Sunday · Type of tea · Biscuit · Radio station · Saying · Dance · Sitcom |
| Mind · Samaritans | Song · Way to spend Sunday · Weather for walk · Landscape · Form of exercise · Book · Hobby · Sound · Time of day — *the quiet, restorative topics* |
| British Heart Foundation | Form of exercise ★ · Sport to play · Weather for walk · Landscape · National park · Vegetable · Fruit |
| Stroke Association | Form of exercise · Song · Weather for walk · Word — *see note E* |
| Diabetes UK | Fruit · Vegetable · Form of exercise · Breakfast cereal — *see note E* |
| RNIB | Sound ★ · Smell ★ · Radio station ★ · Instrument · Song · Weather — *the non-visual senses* |
| Scope | Song · Film · Way to spend Sunday · Sport to watch — *neutral by design; see note E* |
| Cancer Research UK · Macmillan · Marie Curie · Hospice UK · St Richard's Hospice | **pair via the person, not the cause.** Occasion-level only: Flower · Garden to visit · Season · Time of day · Sound. For a sponsored event, use the Achievement row |
| Médecins Sans Frontières · Oxfam · Save the Children (international) | Country ★ · Cuisine · Way to travel · Weather · River — *see note F* |

---

## 2b. Occasion ↔ charity (the Honour–Charity edge)

The edge the first draft left out. A charity *belongs* at an occasion when it
cared for the person, fought what took them, mirrors the good fortune being
celebrated, or is the cause the effort is for.

| Occasion | Charities that belong |
|---|---|
| Memorial · Celebration of life · Tribute · In memoriam appeal | Marie Curie ★ · Hospice UK ★ · St Richard's Hospice ★ · Macmillan ★ · Cancer Research UK · Alzheimer's Society · Stroke Association · British Heart Foundation — *whoever cared for them, or fought what took them* |
| Pet memorial | Dogs Trust ★ · RSPCA ★ |
| Christening · New baby · Baby shower | NSPCC ★ · Barnardos ★ · Save the Children ★ · Children's Society |
| Birthday (a child's) | NSPCC · Barnardos · Save the Children · Children's Society |
| Milestone birthday · Retirement · Anniversary | Age UK ★ · Alzheimer's Society (a long life, a long marriage) |
| Recovery | *the condition's charity:* Stroke Association ★ · British Heart Foundation ★ · Mind ★ · Macmillan ★ · Cancer Research UK · Diabetes UK |
| Achievement · Sponsored event | *the cause the effort is for:* RNLI ★ (a swim) · British Heart Foundation ★ (a run) · Macmillan · Mind |
| Wedding · Engagement · Renewal of vows | Shelter ★ (a home, in lieu of gifts) · Crisis |
| New home | Shelter ★★ · Crisis ★ · St Mungo's ★ — *the mirror of one's own good fortune* |
| Family gathering (Christmas) | Crisis ★★ (Crisis at Christmas) · Shelter ★ · Trussell Trust ★ · Age UK (alone at Christmas) |
| Family gathering · Reunion | Age UK · Trussell Trust |
| Citizenship | Oxfam · Médecins Sans Frontières · Save the Children — *see note H* |
| Leaving do · New job · Promotion · Graduation · Exam success | Barnardos · Children's Society (a start in life) — *weak; see note H* |
| Coming out · Divorce party | Mind · Samaritans — *see note H* |
| Team celebration | the club's own charity — *untabled* |
| Fundraiser · Charity night | the charity **is** the occasion; this edge is trivially present |

> This section resolves note G. Cancer and hospice charities have no
> charity→topic row because their edge is *this* one — memorial ↔ the people
> who cared for them — and it is the strongest occasion↔charity pairing in the
> table.

---

## 3. Theme → topics

Party themes from the 2026-09-23 research, mapped to catalogue topics. These
are the strongest front-loaded pairings there are: nobody asks why dinosaurs at
a dinosaur party.

| Theme | Topics |
|---|---|
| Dinosaur | Dinosaur ★★ |
| Superhero | Superhero ★★ |
| Pirate | Pirate ★★ |
| Space | Planet ★ · Constellation |
| Circus | Circus act ★ |
| Unicorn · Mermaid | Mythical creature ★ · Sea creature |
| Princess · Fairy | Fairy tale ★ |
| Halloween | Halloween costume ★★ · Mythical creature |
| Christmas | Christmas song ★ · Christmas film ★ · Carol ★ · Christmas tradition ★ |
| Decade (80s, 90s, Gatsby) | Decade ★ · Music era ★ · Song |
| Casino · Bond | James Bond ★ · Card game · Cocktail |
| Eurovision | Song ★ · Country |
| Football | Football team ★ · Footballer |
| Safari · Jungle · Farm | Animal ★ |
| Under the sea | Sea creature ★ |
| Tea party | Type of tea ★ · Cake · Biscuit · Sandwich |
| Bake-off | Cake ★ · Pie · Pudding · Biscuit |
| Film night | Film ★ · Film genre · Actor |
| Karaoke | Song ★ · Band or artist |
| Garden party | Flower ★ · Garden to visit · Cocktail |
| Quiz night | School subject |

---

## 4. The rubric (what "quality" means)

Once generation starts from the table, scoring collapses to counting edges
plus one judgement on the note.

| # | Check | Edge |
|---|---|---|
| **E1** | Topic in the occasion's row (§1) or a theme (§3) | Honour → Love |
| **E2** | Topic in the charity's row (§2) | Charity → Love |
| **E3** | Charity in the occasion's row (§2b) | Honour ↔ Charity |
| **E1′** | *Substitute for E1:* the Story states a known fact that motivates the topic — in the About, so it's read before pledging | the **person** → Love |
| **P1** | A personal note exists and names a **real item** from the poll | payoff present |
| **P2** | The note carries **one concrete detail** about the person's relationship to it | payoff has weight |

| **A1** | The About adds at least one fact **about the person** that the edges don't already carry | resonance |

- **Synergy** = edges present, 0–3. E1′ counts as E1.
- **A1 is required at every edge count, not only zero.** A ★★★ triad whose
  About merely restates its edges is legible and flat — nobody's. See §4b.
- **Triad** = 3. These are the exemplars: what goes on home, what a cold reader sees first.
- **Seed bar** = 2 or more for a protagonist favpoll. Staging should hold plenty of twos — real organisers make them.
- **Cause favpolls** have no Honour vertex, so their bar is E2 plus a stated event.
- **Payoff** = P1 and P2. **P2 is the only check that needs a model**; every edge and P1 are lookups.
- **Gate** = seed bar and payoff. Below the gate is not seeded.

So a ~1,500-favpoll reseed needs the model for **two** judgements per favpoll
(A1 and P2), on Haiku, and the rest is table lookups. Cheap — and the mix of
threes and twos is a knob, not an accident.

---

## 4b. Two axes, not one (founder question, 2026-09-23)

> "Is an exemplar with a self-explanatory triad higher quality than a weaker
> triad with a strong story that binds the triad?"

They are not on one scale.

**Self-explanatory edges are generic.** A swim, the sea, lifeboats — every edge
of Ben's triad is a property of the occasion and the charity. It would be true
of anyone swimming the Channel for the RNLI. Nothing in it is about Ben.

**Story-bound edges are specific.** "Her home was full of deliberate colour"
binds memorial→colour, and it is *about Belinda*. The binding is not a repair
on a weak edge; it is where the person enters the favpoll. Honour lives in
specificity — the topic gives the *what*, the story gives the *someone*.

| | Legibility | Resonance |
|---|---|---|
| Measures | how fast a cold reader gets *why this topic* | what the story adds that the edges don't carry |
| Comes from | edges on the card (★) | facts about the person in the Story |
| Self-explanatory triad, flat story | high | low |
| Weak triad, strong story | low | high |
| Legible triad **and** a story that adds the person | high | high — **the corner** |

Ben's regenerated Story reached the corner: the triad is on the card, and the
About added "he swims the sea pool there most mornings". The story did not bind
the triad — it bound *Ben* to it.

**Which to prefer depends on the reader:**

- **Home page, cold reader** — legibility. Gary's problem is a legibility
  problem; nothing else reaches him.
- **The wizard's inspiration door, the organiser** — resonance, decisively.
  The organiser's job is to write the story. A triad that looks like it wrote
  itself teaches nothing; Belinda teaches "I could say that about Dad."
- **The guest already on the page** — both work; the bound one moves more.

So the exemplar set should be chosen **per surface**: legible triads for the
shelf and the home page; bound ones for the wizard door. And the seed should
aim for the corner on every favpoll — A1 is what enforces it.

That means a ~1,500-favpoll reseed needs the model for **one** judgement per
favpoll, on Haiku, and the rest is lookups. Cheap.

---

## 5. Review notes — the calls I'm least sure of

> **Founder, 2026-09-23: "D, E and H are well noted. I think we need to be
> extra cautious here."** Treat those three rows as HOLD — not to be used by
> the generator until the founder has approved each pairing individually.

- **A. Bar or bat mitzvah.** I don't know the occasion well enough to rank these. Left unmarked deliberately.
- **B. Award.** Too broad to table — a teaching award pulls for School subject, a music award for Instrument. Suggest the generator treats it like Achievement: pick from what the award is *for*.
- **C. Coming out.** Kept to Song / Musical / Band or artist / Film. Anything more specific felt like it was making assumptions on the person's behalf. Your call on whether it belongs in the table at all.
- **D. Homelessness charities.** "Topics of home" (Comfort food, Smell, Way to spend Sunday) is the idea. It could read as pointed if the About isn't careful. Worth a second look.
- **E. Health charities where the topic could jar.** Diabetes UK must never pair with Sweet, Cake, Pudding, Chocolate bar. Stroke Association → Word is a real link (aphasia) but may be too close to the bone. Scope I left neutral on purpose — the cause is equality, not a topic family.
- **F. International charities.** Country · Cuisine · Way to travel risks reading as a holiday. Oxfam's own prod favpoll uses Film, which passes nothing here. May be better paired via the *event* (charity night, sponsored event) than the cause.
- **G. Cancer and hospice charities have no charity→topic row.** Resolved by §2b: their edge is occasion↔charity (memorial ↔ the people who cared for them), the strongest in the table. A Macmillan *fundraiser* still reaches for the event row (bake sale → Cake) or an Achievement pairing for its Love edge.
- **H. The weak occasion↔charity rows.** Citizenship → international charities, career milestones → children's charities, and coming out / divorce → Mind or Samaritans are all reachable but thin, and the last pair risks a jar between a playful occasion and a serious charity. I'd rather leave those occasions at two edges than force a third.

---

## 6. The Story engine — one generator, two callers (founder, 2026-09-23)

> "The organiser may not create an exemplar favpoll but if they generate an
> example, it should be as high quality as possible, since its intent is to
> inspire."

Seeding and the wizard's **Generate an example** are the same task downstream
of the triple. Only the caller differs.

| | Seeding | Organiser's Generate (`generate-draft.ts`) |
|---|---|---|
| The triple | **chosen** from the table — edges by construction | **given** — 0 to 3 edges |
| Story's job | write the edges in | write whatever edges exist in; **at zero edges, supply E1′** |
| Judge loop | retry until P2 passes | one pass; re-roll exists (`skipCache`) |
| Wrapper | name · pronoun · occasion · dates · opening line · pledges | already present |

### What the engine receives

Today the generator gets register, topic + items, charity name + description,
pronoun, grouping, display name — and has to *infer* synergy. It should also
receive **the edges, as text**, looked up from this table:

- E1 — *"a favourite place fits a retirement: the freedom to finally go"*
- E2 — *"the RNLI saves lives at sea; a seaside town is where they work"*
- E3 — *"Marie Curie nurses care for people at the end of life"*

That is the "headroom" noted on 2026-09-18 (the prompt gets no event context).
It is a lookup, not a model call.

### What the About must do, by edge count

| Edges | The About |
|---|---|
| 3 | states the triad plainly — the swim, the sea, the lifeboats — then invites |
| 2 | states the two edges; may add a known fact to tighten the third |
| 1 | states the edge **and** supplies a known fact (E1′) for the other side |
| 0 | **must** supply E1′: a plausible, specific fact about the person that makes *this* topic theirs — and say it in the About, not only in the note |

E1′ is what today's generator did for Ben once the pronoun was respected
("He swims the sea pool there most mornings"). It was never told to; it was
never told which edges it had. Told both, it will do it reliably.

### What the engine must never do

Characterise a charity it has no family for. Today the prompt says *"say
'charity' generically"* only when there is **no** charity; when there is a
name and no description it passes the name alone, and the model fills the
gap. A register-added charity with no family is named in the About and
nothing more.

### What the note must do

P1 and P2, unchanged: a real item, one concrete detail about the person's
relationship to it. The note pays off the fact the About set up — the two
halves of the Story agree.

### A third caller, later

The wizard can **suggest** as well as write: organiser picks Alzheimer's
Society → offer `Song` from its row; picks Retirement → offer `Place`. Same
table, no model. Out of scope now; noted so the table is built to serve it.

---

## 7. Two things the table changes elsewhere

**Keep the `is_exemplar` flag even if the status is retired.** As of today it
is load-bearing: `charity_stats`, `all_charity_stats` and the all-time record
trigger all exclude `is_exemplar = true`. Retiring the *badge* is fine.
Retiring the *flag* puts fiction back into charity totals and the permanent
record. If the word is wrong, rename it (`is_fictional`) — don't drop it.

**The card can carry the occasion only through the opening line.** The
`/favpolls` card shows eyebrow · name · topic · charity. The occasion *type*
(Retirement, Wedding) isn't a field on it — so an occasion-motivated pairing
stays front-loaded only if the opening line names the occasion ("Retiring",
"Getting married"). The generator should write it that way.
