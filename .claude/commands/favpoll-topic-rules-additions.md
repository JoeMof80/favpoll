# favpoll — topic ruleset (additions)

> Drop-in sections for `favpoll-topic-rules.md`. These three sections formalise
> what had been working agreements: how to decide a topic belongs in the
> library, how to decide the way it should be built, and how overlap between
> topics and items is handled. Merge under the existing quality standard.

---

## A. Is this a favpoll topic? (the five tests)

A candidate topic should pass **all five**. If it fails one, it is usually not a
favpoll topic — or it is the wrong framing of a good one.

1. **Relatability.** Most guests at a typical occasion can hold a view without
   specialist knowledge. _Favourite colour_ passes; _favourite mid-cap stock_
   fails.
2. **Affection, not knowledge.** People have a _favourite_ — driven by taste,
   memory or identity — not a _correct answer_. _Favourite song_ passes;
   _favourite chemical element_ is trivia wearing a favourite's clothes.
3. **Nameable answers.** Responses are discrete and pickable, not free-form
   prose. _Favourite film_ passes; _favourite memory_ is too open to poll.
4. **Carries the occasions.** It can hold warmth or reflection across the
   register from memorial to celebration. A topic that only works as a laugh is
   weaker than one that also works at a memorial.
5. **Reveals the person.** "Her favourite X was Y" is a small window into who she
   was. This is the whole premise; if the answer reveals nothing, the topic is
   inert.

### Disqualifiers

A topic that trips any of these is normally rejected, even if it passes some of
the five:

- **No affective pull** — nobody has a _favourite_ (e.g. favourite tax band).
- **Answers too open** — cannot be reduced to nameable options (favourite
  feeling, favourite memory).
- **Divisive in a way that breaks shared warmth** — splits a room along lines
  the occasion is meant to set aside (favourite politician, favourite religion).
  favpoll is a space for shared affection, not for taking sides.
- **Too niche for the room** — most guests cannot play.
- **Harm-adjacent** — anything that makes light of, or invites, harm.

---

## B. How to build it (the bounded × volatile matrix)

Once a topic passes section A, two questions decide _how_ it is built — and,
crucially, how much ongoing maintenance it carries.

- **Bounded or unbounded?** Is there a complete real-world set (counties, birds,
  months), or is the set effectively open (songs, books, sayings)?
- **Stable or volatile?** Does the set change over time (current top-flight
  clubs, current drivers) or stay put (colours, fairy tales)?

|               | **Stable**                                      | **Volatile**                                                                  |
| ------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| **Bounded**   | Maximal closed list. Complete and recognisable. | Maximal list **+ scheduled refresh**. The set is finite but its members move. |
| **Unbounded** | Curated strong starter; guest-add expected.     | Legends-heavy starter; guest-add; **accept staleness at the current edge**.   |

Notes:

- **Maximal** means the complete, recognisable set (every county; the UK
  butterflies). **Starter** means a strong curated opening that guests extend.
- **`is_finite: true`** is reserved for genuinely closed sets where guest-add is
  wrong (months, days of the week, counties). Most topics are
  `is_finite: false`.
- **The volatile column is a maintenance commitment, not a one-off.** The
  library's centre of gravity sits in the two _stable_ cells. Volatile topics
  (footballers, F1 drivers, tennis players, and to a lesser extent current TV /
  games / cars / top-flight clubs) need a light review roughly annually. Budget
  for it when adding one; do not add a volatile topic you are not willing to
  maintain.
- **Current names must be verified, not recalled.** When first building or
  refreshing the current edge of a volatile topic, check live sources rather
  than relying on training data. The legends portion is stable and does not need
  checking.

---

## C. Overlap policy (topic-level vs item-level)

Overlap is two different things, and they are treated oppositely.

- **Topic-level overlap is bad. Avoid it.** Two topics that ask substantially
  the same question (e.g. two near-identical "favourite pudding" topics) split
  the same affection across two entries and weaken both. Before adding a topic,
  check it is not a rephrasing of one that exists. Where two topics are close but
  genuinely distinct, the distinction must read as a _different question_ — e.g.
  _Sport to play_ (you do it) vs _Sport to watch_ (you follow it) vs _Form of
  exercise_ (non-competitive). If you cannot state the different question in a
  sentence, it is one topic, not two.

- **Item-level overlap is fine, and often intentional.** The same answer can be
  a natural favourite under more than one question. _Port_ belongs in both
  _Spirit_ and _Wine_; _Apple pie_ in both _Pie_ and _Pudding_; _Bamburgh_ in
  both _Castle_ and _Beach_; _Shepherd's pie_ in both _Pie_ and _Comfort food_.
  These are blessed crossovers, not duplicates to be cleaned up.

**The test for whether an item belongs in a topic:** _does it read as a natural
answer to this topic's question?_ If yes, it belongs — regardless of whether it
also answers another. The data layer permits duplicate labels across topics by
design, and the reveal→item linter does not police cross-topic overlap. Nothing
here is enforced by a checker; it is a curation standard.

## D. Enacted favpolls (founder's rulings, 2 October 2026 — revised the same day)

There is ONE shape of favpoll. Some favpolls carry an **outcome**: the
guests' picks decide something on the night (the cheese board, the
playlist, the game after lunch). An outcome is a kind of About, not a
field and not a shape: the About's closing sentence promises it, in one
of two forms, "the winner is …" or "the top N are …", and that is all a
guest needs to see before picking. (An outcome FIELD was built and
dropped the same day: the promise must be visible before the pledge, so
it belongs in the About; a field beside the note was the wrong place.)

1. **Generate gets a switch**, "the picks decide the night", a segment on
   the Generate button beside the who menu. On, Generate writes the
   About with the outcome promise as its closing sentence and the
   personal note as a shared memory of the pick; off, the reveal
   promise as today. The pairing row's `enacted` sentence pre-sets the
   switch where the occasion and topic pair that way. An organiser can
   write the same by hand without the switch.
2. **"Vote" stays banned.** "Pick" carries it.
3. **The personal note keeps its name.** It was settled with the
   cold-reader research and "personal" is the voice, not the content.
   Its hint gains the fourth case: "A direct quote, a memory, a message
   to guests, or what happens next. Revealed only after a guest
   pledges." At the organiser's discretion the note can carry the
   outcome's detail ("the board's set, see you Saturday").
4. **Suspend, not a second date.** Any favpoll can be suspended: from
   that moment the pick step disappears and every pledge goes to the
   shared pot, until the close date, which keeps its one meaning
   (giving closes). The organiser suspends from manage, or sets a time.
   The standings freeze at that moment and say so. "Shared pot" keeps
   its name; the copy carries the state ("The picks are in. Your pledge
   goes to the pot."). This serves the enacted night AND the memorial's
   late donor.
5. **The live display's finale** types the note at the close, as it
   does for every favpoll; nothing enacted-specific.
6. **Never a memorial.** No memorial, tribute, remembrance or pet
   memorial row carries an outcome.
7. **The record keeps every pick.** A favourite in a context is still a
   favourite; every pick is made in one, and the record has always been
   a record of favourites as expressed at events. No exclusion.
8. **Which rows.** Section D of
   references/subsets-pairing-revisit-2026-10-01.md is the accepted set
   of pairing rows that carry an `enacted` sentence: Cheese board,
   Karaoke song, Party and Classic board game, Roast dinner meat and
   vegetable, Sunday roast, Christmas classic, Family Christmas film,
   Christmas number one, Christmas carol at home, Takeaway curry,
   Classic cocktail at a party. Straddlers (Wedding song before the day,
   Christmas carol, Wedding flower, Classic board game) carry both
   readings and the timing or the About decides.

Nothing mechanical remains but the switch and suspend.

## E. Pairing tests beyond the constituent one (1 October 2026)

The constituent test (★: the topic happens AT the occasion, scored on the
occasion alone) is necessary and not sufficient. Four more, found by
revisiting the pairing table with subsets:

- **Memorial.** At a memorial the topic is something the person loved,
  never something the person was. Pet at a pet memorial fails: the reveal
  is "a dog" and a different pick reads as disloyalty. Dog breed passes:
  the reveal is the owner's.
- **Reveal.** The reveal must be something only the subject could tell
  you. Team sport to play at a club's own celebration fails: it reveals
  the club.
- **Surprise.** The reveal must not be a surprise the occasion itself
  delivers. Wedding song, Wedding flower and Love poem at the wedding
  leak the first dance, the bouquet and the reading before the day and
  are redundant after it; they are anniversary rows.
- **Room.** The pick must be one the room can make without being asked
  something it does not want to answer. Funeral song asks guests about
  their own funeral at a wake; Black tea asks them to pick between
  varieties they cannot tell apart.

Never let the About rescue a row that fails ("Max converted her from
cats" would carry Pet): that is the About supplying the link the card
cannot, the trap the pairing-table note of 23 September warns against.
