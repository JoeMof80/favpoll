---
name: favpoll-placeholders
description: >
  Use this skill whenever generating, reviewing, or improving about and
  personal_reveal copy for favpoll topic-occasion combinations — whether
  for the seed script, demo scenes, or placeholder copy in lib/occasions.ts.
  Trigger on any request to write about placeholders, reveal copy, or to
  populate seed data with example events.
---

# favpoll Placeholder Copy

This skill governs the generation of high-quality `about` placeholder copy
and `personal_reveal` pairs. These are the most important copy in the product.
Get them right.

Read `references/EXAMPLES.md` for worked examples before writing any copy.

---

## The mechanic

The `about` placeholder is shown in the canvas textarea while the organiser is
writing the protagonist description. It introduces the person and references
the topic area without disclosing their answer.

The `personal_reveal` is shown to guests only after they have pledged. It
discloses the protagonist's favourite.

The pledge is the threshold. The guest gives something; the protagonist gives
something back.

**`personal_framing` is retired.** The column still exists in the database but
the app no longer reads or writes it. The guest-facing hint line —
"Is it the same as [Name]'s?" — is auto-generated from the protagonist's name.
Do not write framing copy. Do not add a `framing` field to seed data.

**The reveal must never appear in the about.** If the about describes lavender
in the garden, it leaks a Flower reveal of Lavender. If it describes spring
gardening behaviour, it leaks a Season reveal of Spring. The about must
introduce the person and reference the topic area without pointing at the
answer.

---

## The character brief

Before writing any about or reveal, establish a character brief for the
protagonist. Every element of the copy should be traceable back to it.

```
Name:              [full name, or couple/group name]
Age / life stage:  [e.g. "79, retired headmistress" or "22, just graduated"]
Occasion:          [the occasion type]
Key detail:        [one specific, concrete fact about this person]
Charity:           [name + one sentence explaining why this charity, not another]
Topic:             [the poll topic]
Their answer:      [what their favourite actually is]
Reveal note:       [what makes this reveal specific and human]
```

The charity explanation is not optional. If you cannot write one sentence
explaining why this charity belongs to this person on this occasion, the
charity is wrong. Change it.

---

## The charity must be load-bearing

The charity is not a default. It is not "a good cause." It belongs to this
person, on this occasion, for a named reason.

**Good charity connections:**

- Marie Curie for Belinda's memorial — their nurses visited her at the end
- The Woodland Trust for Ros's retirement — she's been a member for twenty
  years and once organised a school trip to plant trees
- WWF for Alex & Jordan's engagement — they met volunteering at a giant panda
  conservation centre in Chengdu
- The Prince's Trust for James's graduation — the Trust funded the summer
  engineering programme that made him apply to university
- Great Ormond Street for Poppy's birthday — her younger brother was treated
  there as a child; the family have supported them ever since
- Comic Relief for Dave's leaving do — he organised the office collection
  every year without being asked

**Failure mode:** "Cancer Research UK" for a graduation. "RNLI" for a wedding
because they met on a beach. These are guesses. They feel arbitrary because
they are.

---

## About placeholder patterns — vary across examples

Three valid structures. No two adjacent examples should use the same one.

**Topic-forward** — leads with the protagonist's relationship to the topic area:

> "A retired teacher and mother who had a colour she returned to for forty
> years — in her wardrobe, in her garden, in every room she made her own."
> "David had strong views about biscuits that his team found both surprising
> and entirely consistent."

**Backstory-forward** — leads with who the person is, lets the topic emerge:

> "Belinda gave forty years to teaching and twenty to her garden. She had very
> strong opinions about most things, and very precise taste in others."
> "After thirty-five years building his team from four people to four hundred,
> David is finally retiring. Ask anyone who worked with him what kind of music
> was always playing."

**Occasion-forward** — grounds the about in the favpoll before reaching the topic:

> "Sarah is turning 40 and has never made a neutral choice about anything. The
> flat has one wall that's been repainted twice and still isn't right."
> "Tom has just finished four years at architecture school. He spent most of
> them in the studio with one kind of music on. His housemates have opinions
> about this."

Mix these. If you write three entries and all three use the same approach,
rewrite at least one.

---

## Reveal register — match the occasion

**Memorial / tribute** — first person where possible (the note was written by
the protagonist or adapted from something they left). Measured. No exclamation
marks. Specific detail over general sentiment.

> ✓ "Mine was purple. I wore it to every occasion that mattered."
> ✓ "Autumn, always. She never needed a reason."
> ✗ "She loved autumn because it reminded her of the beauty of life."

**Birthday / celebration** — light, specific, a little personality. The reveal
can have a voice that sounds like the person talking.

> ✓ "Mint choc chip, of course. What do you mean you didn't know?"
> ✗ "Mint choc chip — her absolute favourite!"

**Leaving do / workplace** — warm, slightly funny, grounded in a real detail.

> ✓ "Bourbon. He kept a secret stash in his desk drawer and everyone knew."
> ✗ "Bourbon biscuits — classic Dave!"

**Graduation / milestone** — specific to the person's story. Can carry more
weight than a birthday but shouldn't be elegiac.

> ✓ "Jurassic Park. He said it was the reason he applied to study engineering.
> His housemates were not surprised."
> ✗ "Jurassic Park — a film about wonder and possibility, just like James's future."

**Engagement / wedding** — can be a story in miniature if the couple have one.
Third person, warm, earns the emotion.

> ✓ "The giant panda. They met at a conservation centre in Chengdu.
> Did you really need to ask?"
> ✗ "The giant panda — their favourite animal and a symbol of their love."

---

## Specificity over sentiment

The best reveals contain one concrete, unambiguous detail that could only be
true of this person.

> ✓ "He kept a secret stash in his desk drawer and everyone knew."
> ✓ "He said it was the reason he applied to study engineering."
> ✓ "I wore it to every occasion that mattered."
> ✗ "She loved it more than anything."
> ✗ "It meant the world to him."

If you find yourself writing a sentiment instead of a detail, stop and ask:
_what specifically did this person do, say, or own that proves this was their
favourite?_

---

## Topic variety — check before finalising

Across any set of examples (demo scenes, seed data, placeholder sets), verify:

- No topic appears more than once
- Finite topics (Colour, Season, Day of the week, Meal of the day, Time of day,
  Decade) are used sparingly — infinite topics show the product's range better
- The mix includes at least one clearly light occasion (leaving do, birthday,
  sports achievement) and at least one solemn one (memorial, tribute)

**Finite topics** have fixed option lists. The reveal answer must be from that
list exactly. Do not invent options.
**Infinite topics** should have exhaustive or near-exhaustive option lists —
the point is that choosing from 35 films means something precisely because
the list is vast.

---

## Failure modes — never do these

- **Reveal in the about**: if the about references lavender, it leaks a Flower
  reveal of Lavender. If it describes spring gardening behaviour, it leaks a
  Season reveal of Spring. Write the reveal first, then check the about
  against it word by word.
- **Writing about first**: always write the reveal before the about. The
  opposite order produces abouts that unconsciously point toward the answer.
- **Repeated topics**: three "favourite season" examples in six scenes is not
  variety. It is a failure of imagination.
- **Arbitrary charity**: if you cannot name a reason, the charity is wrong.
- **Elegiac register for non-memorial occasions**: "one last time" implies
  finality. Do not use it for a retirement, a birthday, or a graduation.
- **Generic sentiment in the reveal**: "it meant everything to her" tells the
  guest nothing. Give them a detail.
- **Overly constructed reveals**: "She said it was the only season that kept
  its promises" is trying too hard. Real people don't talk like that.
  Simpler is better.
- **Mismatched protagonist and topic**: a 22-year-old engineering graduate
  whose favourite film makes him cry every time is a specific character choice
  that needs to earn itself. Match the topic and reveal to who the person
  actually is.

---

## Working with seed data

When populating `scripts/seed.ts` with placeholder copy:

1. Write a character brief for each protagonist before touching the code
2. Confirm the charity connection before writing anything else
3. Write the reveal first — if you cannot make it specific, the topic is wrong
4. Write the about second, ensuring it withholds the reveal
5. Check topic variety across the full set before committing
6. Use different protagonists from the demo scenes — the seed data should feel
   like a different set of real events, not the same six people again

The `TopicPlaceholders` type in `scripts/seed.ts` is:

```typescript
type TopicPlaceholders = {
  [occasion: string]: { about: string; reveal: string };
};
```

There is no `framing` field. Do not add one.

The seed occasions are: `memorial`, `tribute`, `birthday`, `retirement`,
`wedding`, `engagement`, `anniversary`, `leaving`, `graduation`, `christening`,
`achievement`, `recovery`, `award`, `promotion`, `celebration`, `other`,
`default`.

Seed protagonists should be as diverse as the demo set in name, age, occasion,
and background. The demo characters have their own backstories
(see `references/EXAMPLES.md`) — seed characters should have briefs of their
own, even if those briefs never appear in the UI.
