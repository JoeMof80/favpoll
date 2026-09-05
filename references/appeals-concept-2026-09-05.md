# Appeals (parent campaigns) — concept note, 2026-09-05

The "own conversation" promised in the 2026-08-06 handoff ("one
campaign with many people each running a favpoll under it... a real
product concept — a parent campaign, aggregate totals, a leaderboard
of favpolls"). Held until now; written with the manage-hub/console
work (#677–#686) and the CTA-preselect mechanic (#698) in place.

## Naming

**"Appeal", not "campaign".** Campaign is JustGiving's vocabulary;
appeal is UK-charity native ("Winter Appeal", "Midnight Walk Appeal")
— and the house exemplar cause favpoll is already "The Sunshine
Appeal". Founder to confirm.

## What it is

A parent appeal under which many people each run their OWN favpoll.
The hospice creates the Midnight Walk appeal; each walker creates a
favpoll attached to it; the appeal page shows the aggregate raised
and a leaderboard of member favpolls. This is the one structural
thing JustGiving has that favpoll cannot do — and favpoll's version
keeps what JustGiving can't offer: every member page is a favpoll,
with its own topic, standings and reveal.

## The critical property: no new money handling

An appeal is an AGGREGATION VIEW. Pledges flow per-favpoll to the
charity exactly as today; the aggregate is a sum over members (a
campaign cousin of favpoll_live_totals). The Goodstack rail, the 0%
promise and the PF/CP legal surface are untouched. Big for sales,
small for risk.

## What an appeal fixes on its members

- **Charity: locked.** A Midnight Walk raises for the hospice. The
  join link preselects AND locks it (the #698 wizard mechanic,
  extended with a lock).
- **Close date: optionally inherited** (the appeal's end).
- Everything else — subject, topic, story, reveal — is the member's
  own. Individuality is the product's soul; the appeal must not
  flatten it.

## Where the story lives

The 08-06 verdict: no long-form story on favpolls (withholding IS the
mechanic). The APPEAL page is where a few founder-voice sentences
legitimately belong — the B2B actor's surface. The story tension that
started this thread resolves at the parent level.

## Surfaces

- **/appeals/[slug]** (public): identity (name, charity, photo, a
  2–3 sentence blurb), live aggregate, leaderboard of member favpolls
  (per-poll totals are already public — no anonymity-model conflict;
  "presence not size" governs individual pledgers, not polls), and
  "Start your favpoll" → wizard with appeal+charity preselected.
- **Appeal console** (owner): the member list is ConsoleRow nearly
  verbatim; the owner is a professional, the manage-hub thesis's
  first-class citizen.
- **Member manage hub**: one line showing appeal membership.

## Data sketch

- `appeals`: id, slug, name, blurb, photo_url, charity_id,
  created_by, opens_at, closes_at, is_listed.
- `favpolls.appeal_id` nullable FK; set at creation via the join
  link; locks charity server-side (updateFavpoll refuses changes, the
  existing locking idiom).
- `appeal_live_totals(appeal_id)` RPC: sum over member favpolls.

## v1 cuts

No teams. No appeal-level pledging. No self-serve appeal creation —
pilot appeals are set up BY HAND for one hospice partner, which makes
this a sales weapon before it is a product: "we'll build your
Midnight Walk appeal" is the strongest line the celebrant/hospice
outreach can carry.

## Open questions (founder)

1. Naming: appeal vs campaign vs other.
2. Charity lock: confirmed as hard?
3. Close-date inheritance: default-on, default-off, or per-appeal?
4. Leaderboard framing: raised-amount ranking of PEOPLE's pages needs
   a tone check for memorial-adjacent appeals — "most raised" can read
   competitive where competition is wrong. Possibly rank quietly
   (alphabetical with totals shown) per register.
5. Does an appeal member's favpoll appear on /favpolls too, or only
   under the appeal?

## Sequencing

Launch flip and Fundraising Regulator work outrank building this.
This note exists so a pilot conversation can pull it off the shelf —
the natural trigger is the first hospice reply to the outreach.
