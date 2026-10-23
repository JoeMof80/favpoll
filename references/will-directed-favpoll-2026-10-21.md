# The will-directed favpoll — developed 21 October 2026

Worked up to be ready to discuss with **Glenn Barsby, Head of Funeral at
FuneralCoop**, whose own published words are what started it. **A concept, not
a plan**: nothing here is built, and the point of the conversation is to have
it tested by someone who has sat with families for a living.

**Current state in the product: one sentence on `/about`.** No feature, no
message keys, nothing in the codebase. Do not describe it to anyone as
existing.

---

## 1. Where it came from

Glenn Barsby, quoted in Membership Matters, 5 May 2026, on Dying Matters
Awareness Week:

> *"These are some of the most important conversations we can have, yet they're
> often the ones we put off the longest. What we're hearing is that people want
> to talk, they just don't know how to start. And when the moment passes, that
> uncertainty can turn into regret."*

The problem he states is one favpoll answers:

- **"They just don't know how to start."** A favourite is a way to start.
- **"When the moment passes, that uncertainty can turn into regret."** A
  favourite recorded in advance is the thing that catches it before the moment
  passes.

**The reframe to lead with, because it is his problem rather than our product:**

> People cannot start because the entry question is wrong. *"Have you thought
> about your funeral?"* asks someone to contemplate their death. *"What was
> your favourite song?"* asks them to talk about their life. Same conversation,
> opposite door.

True, modest, and it earns the right to say the rest.

---

## 2. What is actually missing

**Not the reveal mechanic.** First-person reveal copy is already a documented
register in the brand — *"Mine was purple. I wore it to every occasion that
mattered."* — and `personal_reveal` is the only stored copy field there is. The
emotionally hard part is done.

What is missing is **capture and custody**: how a living person records it,
where it waits, and how an executor finds it.

---

## 3. Why it has to be paper

The obvious design — an account with a stored reveal — is wrong, for the same
reason the funeral-plan idea is hard: **a plan may be redeemed in twenty-five
years, and favpoll may not exist.** A letter of wishes survives a company's
death. A database row does not.

So the artefact is physical:

> **A favpoll-branded card the person fills in by hand** — their topic, their
> favourite, their words — kept with their will or letter of wishes. It tells
> an executor: create a favpoll, here is how, and here is what to put in it.

Four advantages, and they are not consolations:

1. **It survives favpoll.** If the company is gone the family still has the
   words. The sentiment outliving the platform is the only promise worth
   making here.
2. **favpoll holds no data about a living person.** No decades of retention, no
   breach surface, no "what happens to my data when I die". In this setting,
   and to a regulated partner, that is a serious advantage.
3. **It is physical, so it has margin** — which the insert card could not have,
   because that card's QR is unique per favpoll and cannot be pre-printed.
4. **The regulatory exposure drops.** A card in a plan pack is not a software
   promise. Still to check if it is presented as a plan *benefit*, but a far
   smaller surface than a feature guarantee.

This is the **letter-of-wishes kit** already ranked first for brand fit in
`references/PROJECT.md` ("productises the will-writing angle; solicitor
channel"). What is new is the reason it must be paper rather than a screen.

---

## 4. The handwriting loop — the founder's idea, 21 October 2026

**A bounded area on the card for the handwriting, reproduced on the keepsake.**

This is the piece that makes the whole thing work, for two reasons:

- **It makes the keepsake worth buying.** A printed record of a favpoll is a
  printout. A printed record carrying *their own hand* is an artefact of them.
  There is an established market for exactly this instinct — handwriting
  reproduced on jewellery, letters framed. Handwriting is the most personal
  reproducible trace a person leaves.
- **It gives the reveal provenance.** A typed reveal could have been written by
  anyone. Their handwriting is evidence it came from them, which matters in a
  mechanic whose whole claim is "this is what they loved".

It also builds a funnel nothing else here had: the card is cheap or included
with a plan, and it drives the paid keepsake. **The free thing sells the thing
we charge for.**

### Four design constraints, which follow from it

1. **The branding stays OUTSIDE the box.** No logo, texture, watermark or tint
   behind the handwriting. Two independent reasons: a patterned background
   wrecks the contrast when a phone photo is thresholded, and the keepsake
   carries only the person's name (see the co-branding rule in
   [[project-stationery-direction]]). So crop the box and leave the branding
   behind. The two rules agree, which is a good sign.
2. **The box is the word limit.** Its dimensions enforce "one sentence, one
   concrete detail" physically — the reveal rule already in force. The
   constraint is the paper, not a character counter.
3. **Capture two things: the words and the image of the words.** Someone
   writing this may be elderly or ill, and shaky handwriting is *more*
   poignant, not less — **never clean it up or straighten it.** But the reveal
   still has to read, so the text is captured separately. The handwriting is
   the artefact; the typed line is the content.
4. **Dark ink, specified on the card.** Pencil will not reproduce.

### Two risks

- **Whoever photographs it is doing so in the worst week of their life.** It
  has to be a phone photo inside the favpoll flow with the box auto-detected —
  and **the keepsake must work without it.** Never a dependency.
- Image quality from a phone. Hence constraints 1 and 4.

**Technically modest, which is the nicest part: no handwriting recognition.**
Nothing is transcribed; an image is reproduced. Photo, crop, clean up, place.
The point is the hand, not the text.

---

## 5. The money — and not profiteering from it

**Founder's principle, 21 October 2026:** the photograph of the handwriting is
available to anyone who wants a copy, subject to the family's approval. A
quality printed keepsake is worth paying for.

**The test that keeps this clean: can someone who will not or cannot pay still
have the thing?** If the handwriting image is a free download, like everything
else in the print pack, then what is charged for is **printing and posting —
materials and craft, not access.** favpoll never charges for access to a dead
person's words. That is the same line favpoll draws everywhere else, and it is
the answer to give if anyone asks.

Permissions follow the reveal: **the family are the custodians**, and the
organiser controls who may download it. Not public by default.

### Keepsake branding

**Offer an unbranded option**, and where it is marked, use a **maker's mark** —
small, on the back, the way a printer or a bookbinder signs work — never a
brand on the face of it. Reasons:

- The co-branding rule says a personal artefact carries only the person's name.
  Taken seriously, **favpoll's own mark is also a guest on it.**
- A logo dates badly. In thirty years it is the only thing on there that looks
  of its time.
- **The moment it is the family's choice, nobody can read it as favpoll
  advertising on a memento** — which is the ugliest available reading and worth
  designing out.

---

## 6. What to ask Glenn, and what is not his to answer

**Bring the principles, ask the experience.** The register of the approach —
"I want to be sure this is appropriate" — works *because* there is a view to
test, not because there is none. Asking a prospective commercial partner to
adjudicate favpoll's ethics is weak, and it invites the answer that suits a
partner.

**Ours, already decided — do not put these to him:**

- Whether to charge for access to the handwriting. **No.** See §5.
- Whether the keepsake can carry a partner's branding. **No**, and favpoll's own
  mark is a choice, not a default.
- Whether a recorded favourite is binding on the family. **Never.** It is a
  wish, not an instruction.

### The eight questions, in three blocks

Designed so block C only happens if block B lands. **The in-memory questions
are not a warm-up — they produce the numbers the whole plan rests on.** The
bridge to the will-directed idea is a bonus if the conversation goes there.

**A. How it works today — the information we actually need**

1. **When a family wants donations instead of flowers, what happens? Who
   handles it?** Tells us whether "favpoll removes the handling" is even true
   at society scale. Do not assume it is.
2. **What does a collection typically raise?** **THE NUMBER** — it replaces the
   £400 derived in `references/ppgf-volume-note-2026-10.md`. Ask for his
   impression, not a figure he would look up: "roughly, typically" gets a felt
   number from someone who has seen thousands, and that beats nothing.
3. **Roughly what proportion of funerals have one?** The uptake denominator. It
   also surfaces direct cremations without us raising them, which keeps the
   ruling in [[project-funeral-directors]] intact.
4. **Who chooses the charity, and does the family always know what the person
   would have wanted?** The hinge: still a process question, but the first one
   pointing at an absence.

**B. Where it goes wrong — his expertise, and the emotional turn**

5. **What goes wrong with collections? What do you end up fixing?**
   Open-ended, invites him to be the expert, and where the real answer lives.
6. **How often do families not know what the person would have wanted?**
   His own Dying Matters comments say this is what he thinks about, so this
   introduces nothing — it asks him about his own subject.

**C. The bridge — only if B lands**

7. **How often does someone arrive having written anything down?** The
   letter-of-wishes question, asked factually.
8. **"You said people want to talk but don't know how to start. What have you
   seen that actually gets them started?"**

**Question 8 is the whole design.** Do not ask him about will-directed
favpolls — ask what gets people started. Whatever he answers, the reply is
*"That's interesting. I've been wondering whether a favourite is an easier way
in than a wish."* A response to him, not a pitch at him, and he arrives at it
himself, which is the only version that sticks.

**Two rules for the call.** *Ask, then stop talking* — the message promised
questions, and delivering a pitch is exactly the bait-and-switch the founder
was right to worry about; if he asks what favpoll does, answer briefly and
return to asking. And *expect four or five, not eight* — **if it is only
three, make them 1, 2 and 5.** Those alone are worth the call, and 6 and 8
often arrive unprompted once he is talking.

**Write down the answer to question 2 the moment the call ends.** It is the
number that rebuilds the volume note on something real.

### If the card itself comes up — his questions, not ours

1. Would families actually use it?
2. Does it belong in a funeral-plan pack, and would FuneralCoop put it there?
3. What do families do with handwritten wishes today — what already arrives?
4. Would arrangers hand it over, or is it one more thing in a difficult
   conversation?
5. **What goes wrong that we have not thought of?** The real question.

---

## 7. Be ready for these

| Question | Answer |
|---|---|
| What if favpoll does not exist by then? | The paper does. That is the design. |
| Who may create it? | The executor. **Verification is unresolved — say so.** |
| What if the family does not want to? | A wish, never an instruction. |
| What if the named charity has closed? | Up to three charities, plus the recorded failure-case ruling in `references/ppgf-enquiry-draft-2026-07.md`. |
| What does it cost? | The kit yes, the favpoll no. |
| Where does the money go? | A registered charity the family names. favpoll takes no fee from a pledge. |

---

## 8. What not to claim

- **It captures favourites, not wishes.** It is a **doorway** into the
  conversation Dying Matters is about, not the conversation, and the letter of
  wishes remains the actual document. The modest version is true and therefore
  credible; the grand version is neither.
- **It does not exist.** One sentence on `/about`. Discuss it as a concept
  being explored, and do not invent features on the call.
- **No promise of software longevity**, which is the whole reason it is paper.
- Vocabulary: a favpoll has a **topic** and guests **pick** a favourite. It
  never "asks a question" (see [[feedback-never-question-framing]],
  [[feedback-pick-not-choose]]).

**If Glenn responds warmly, that is the signal to build it** — a product
decision informed by a funeral professional rather than by our own intuition.
That is a better reason to build than anything we could reason out ourselves.

---

## Related

- `references/will-writers-pitch.md` — the same idea pointed at solicitors and
  estate planners, with a letter-of-wishes template. **The two are one product
  with two buyers.**
- `references/funeral-society-approaches-2026-10-21.md` — the approach to Glenn
- `references/co-operative-funeral-societies-2026-10-21.md` §5 — the four
  offers, including funeral plans and the FCA problem
- `references/PROJECT.md` — the merchandise direction and the SKU ranking
