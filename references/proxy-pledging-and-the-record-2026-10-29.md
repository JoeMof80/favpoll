# Proxy pledging, and what the record actually counts

_29 October 2026. Arose from the founder's question about running a favpoll in
a U3A room: "how many use phones and know how to scan QR codes?" Everything
below is read from the code, with file and line. See
`channel-strategy-2026-10-29.md` §4b for the demographic evidence._

---

## 1. What the code does

**Multi-select exists, and the split is always EQUAL.**
`lib/pledge-allocations.ts` — `computePledgeAllocations` divides penny-even
across the selected favourites, remainder pennies to the earliest selections.
**There is no per-favourite weighting.** `toggleFavourite`
(`components/pledge-dialog/use-pledge-dialog.ts:118`) is an unbounded set
toggle, so **there is no cap** on how many may be picked.

**Standings count ALLOCATIONS, not guests.** `lib/poll-standings.ts`: "the sum
and count of non-withdrawn pledge allocations per favourite". So one £100
pledge across ten favourites records as ten allocations of £12.50, each with a
count of 1.

**A guest gets one active pledge per poll; a signed-in user has no limit.**
`components/pledge-card/use-pledge.ts:378` — `pledgePreflight` opens with
`if (clerkUserId) return null`, and the comment at :396 states it: *"an account
lets pledges stack (signed-in pledges have no per-poll limit)"*. A guest's
second attempt is met with an invitation to create an account, not a refusal.

**The tip is card-only.** `tipAmount` is priced into the Stripe PaymentIntent
(`app/api/stripe/payment-intent/route.ts`), and
`components/pledge-card/use-pledge.ts:98` says: *"Card pledges only — the fund
path never offers it"*. **A pot-funded pledge therefore earns nothing.**

**The shared pot needs an account.** `use-pledge.ts:66` —
`hasFund = pot !== null && available > 0 && !!clerkUserId`. **A guest cannot
draw from the pot at all.**

**Guest email is captured at the pay step** (`step-pay.tsx:263`), labelled
"for receipt and withdrawal link", and unlike the name field it is **not**
marked optional. *(Not verified: whether validation actually enforces a
non-empty address.)*

---

## 2. The founder's insight, which dissolved the problem

The first framing here was that proxy pledging is a threat. He answered it:
*"if somebody wants to pledge who doesn't have a phone, they can ask somebody
else to make an extra pledge and favpoll would never know. so how is that
different?"*

**It is not. The problem was never proxying — it is the SHAPE of the pledge.**

| Shape | Record | Tips |
|---|---|---|
| A friend makes a **separate** pledge for you | One allocation, correct | One prompt. Identical to pledging yourself |
| One person **multi-selects** ten favourites for ten people | Ten allocations from one pledge | **One prompt for ten people** |
| **Pot** proxy | Attributed to the volunteer's account | **None at all**, and the volunteer must be signed in |

favpoll cannot detect proxying and **does not need to**, because the separate-
pledge shape is data-identical to the honest case.

### THE RECOMMENDED SHAPE, and it needs no build

**A signed-in volunteer with a tablet, pledging once per person.** Stacking is
already allowed for accounts, so this works today: ten pledges, ten payments,
ten tip prompts, and **no email needed per pledge** because the account is the
identity. The email friction only ever applied to guest pledging.

**Do not build a proxy mode, and do not build a proxy flag.** Neither is needed
for the shape above, and both would be spent on an unmeasured problem.

---

## 3. THE RECORD HAS NO CONCEPT OF A PERSON

The important finding, and bigger than proxying.
`supabase/migrations/20260923060000_exclude_exemplars_from_totals.sql:114`:

```sql
all_time_count = (
  select count(*)
  from pledge_allocations pa
  join pledges p on p.id = pa.pledge_id
  ...
  where pa.favourite_id = coalesce(new.favourite_id, old.favourite_id)
    and p.withdrawn_at is null
    and f.is_exemplar is not true
)
```

**It counts allocations. Nothing in it refers to who pledged.** Consequences:

1. **Ten pledges from one account and one multi-select pledge of ten
   favourites are INDISTINGUISHABLE in the record.** So the recommended shape
   preserves the **tips**, and does nothing for the blur. An earlier claim in
   this session that it preserved both was wrong.
2. **`all_time_count` is "how many times this favourite was pledged for",
   never "how many people chose it".** One enthusiast with a card can lift a
   favourite's count as far as they like. **This has always been true.** Proxy
   pledging does not introduce it; it only makes it visible.

### THE QUESTION TO DECIDE, before /record becomes the home page

The primary sort is `all_time_pledged` — money — which is exactly what "pledge
its worth" was designed around ([[project-concept-model]],
[[project-money-standings-model]]), so the money figure is sound.

**But if `all_time_count` is ever presented anywhere as a headcount — "1,204
people chose the Labrador" — that is a claim the data cannot support.** The
long-term plan is for the record to become favpoll's home page
([[project-favpoll]]), so this wants settling before it is load-bearing.

*Not checked: how `app/record/record-client.tsx` and the topic pages currently
label the count in the UI. Do that before deciding.*

Three options, unranked: leave it and never label it as people; dedupe the
count by pledge or by pledger; or drop the count from public surfaces and show
money alone.

---

## 4. What to measure at the first real event

Three numbers nobody has, and no amount of reasoning will produce:

1. **What fraction of a seventy-something room pledges from their own phone.**
2. **What fraction of those add an optional contribution.** This is the whole
   revenue model, and the warmest segment is the oldest one — a real exposure
   worth sizing rather than discovering.
3. **How many need a proxy at all.** If the answer is two people in sixty, the
   roving tablet is a volunteer's improvisation and nothing more.

**Nothing in this note should be built before those three numbers exist.**

## Related

`channel-strategy-2026-10-29.md` §4b (the demographic evidence and the U3A
route), [[project-guest-identity-model]], [[project-shared-fund-mandatory]],
[[project-money-standings-model]], [[project-concept-model]]
