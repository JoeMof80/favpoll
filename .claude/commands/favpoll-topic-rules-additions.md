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
