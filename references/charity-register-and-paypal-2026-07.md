# Charity register imports, PayPal Giving Fund & the 0% fee question

_July 2026. Follows on from `growth-ideas-2026-07.md` §8 (Charity Commission
API) and the disbursement question behind it. Everything below marked
"verified" was tested live against the register API with our key. §3 added
after the founder raised the tip-based revenue model._

---

## 1. Pulling charities from the Charity Commission API

### What the API offers

| Route | What it gives | Verified? |
| --- | --- | --- |
| `searchCharityName/{text}` | Matching charities: name, number, registration status, dates | ✅ — `hospice uk` returns HOSPICE UK (1014851) and HOSPICE UKRAINE (1201755) |
| `allcharitydetails/{number}/0` | Full record: legal name, status, removal date, financials, address | ✅ — used by our verification feature |
| Nightly bulk extract | The full register (~170k charities) as a downloadable dataset | Not tested — exists per CC documentation |
| Logos / images | **Not available** — the API is data only | — |

Coverage caveat: England & Wales only. Scottish (OSCR) and Northern Irish
(CCNI) charities live on separate registers with their own APIs.

### Option A — import the whole register ❌ not recommended

Technically possible via the bulk extract, but it would dissolve a feature.
The curated list is doing real work:

- hand-written descriptions in favpoll's voice (the register's "activities"
  text is legal boilerplate)
- logos, which the API cannot supply
- suggested-topics mappings per charity
- editorial control over what appears at a funeral

170k rows of unlogo'd boilerplate would make the charity picker worse, not
better.

### Option B — "Add from register" typeahead in admin ✅ recommended

Keep the curated model, but change how entries are created: type a name in
the Add Charity form, pick from live register results, and the number +
registered name arrive pre-filled and pre-verified.

- Kills the transcription-error class outright — Hospice UK (stored
  1003017, actually 1014851) and St Mungo's (stored 1079126, actually
  1149085) were both hand-typed wrong numbers that sat undetected until
  the verification backfill caught them.
- Small build: one search endpoint call + a results dropdown on the
  existing form. Everything else (verification columns, badges, cron)
  already shipped.

### Option C — open register for organisers (pick *any* charity) ⏸ wait

The real growth unlock, but it is **gated on payout rails, not on the
API**. Listing a charity we cannot pay is the one outcome to avoid. Which
brings us to PayPal.

---

## 2. PayPal — what was actually suggested

The growth doc's suggestion was **PayPal Giving Fund** (PPGF) — not
"replace Stripe with PayPal checkout". PPGF is itself a UK registered
charity that receives donations and regrants them to other charities. It
covers nearly every UK registered charity with **no per-charity
onboarding**, and it handles Gift Aid. There are two very different ways
to use it:

### Model A — PPGF as the checkout (the eBay model)

Guests pay through PayPal directly to PPGF; PPGF regrants to the chosen
charity.

- ✅ Genuinely no Stripe for those payments
- ✅ Near-universal UK charity coverage, Gift Aid handled
- ❌ **Fatal for the current fee model**: PPGF partnerships generally
  require 100% of the donation to reach the charity — no 5% in-flow fee.
  Revenue would have to move to organiser fees or tips.
- ❌ The live pledge experience (payment intents, shared fund, instant
  ranking updates) is built on Stripe — this would be a rebuild.

### Model B — PPGF as disbursement only ✅ the one worth investigating

Keep Stripe exactly as-is for pledges. Deduct the 5%. Grant the 95% to
PPGF with a per-charity recommendation.

- ✅ Preserves the pledge UX and the fee model untouched
- ✅ Replaces per-charity Stripe Connect onboarding with **one** payout
  relationship — this is what makes Option C (open register) feasible
- ⚠️ Charities receive money via PPGF, so attribution is indirect
  (statements are possible but it arrives as a PPGF grant)
- ⚠️ Adds payout latency (typically weeks, not days)
- ⚠️ Requires a PPGF partnership application — a business-development
  conversation, not an API key

### The strategic fork

Disbursement is currently unsolved either way (Stripe Connect application
still pending). The choice for the open-register future is:

| | Stripe Connect | PPGF (Model B) |
| --- | --- | --- |
| Charity coverage | Only charities that onboard | Nearly all UK registered |
| Onboarding burden | Per charity, slow | One application, once |
| Attribution | Direct payout, clean | Via PPGF grant |
| Gift Aid | favpoll would build it | Handled by PPGF |
| Fee model | Untouched | Untouched |
| Latency | Days | Weeks |

---

## 3. The 0% fee question (tip-based revenue)

**DECIDED (founder, 2026-07-04): favpoll charges no platform fee — 100%
of every pledge goes to charity.** Implemented in the app and brand docs
the same day (fee removed from the pledge charge, copy updated
everywhere). Open sub-decisions: processing-fee treatment (favpoll
covers vs deducted — awaiting the PPGF answer) and the contribution/tip
prompt itself, which is not yet built.

### The premise is correct

Both major platforms run 0% platform fees funded by voluntary tips
(2026, verified):

| | Platform fee | Processing (UK charity) | Gift Aid | Revenue source |
| --- | --- | --- | --- | --- |
| JustGiving | 0% | 1.9% + 30p per donation | **Takes 5% of the Gift Aid claimed** | Voluntary donor contribution |
| GoFundMe | 0% | 1.9% + 20p per donation | 100% passed to charity | Voluntary donor tip (default prompt, settable to 0) |

Tip realisation across the industry is commonly quoted at 8–12% of
donation value — i.e. the tip model typically **out-earns** a 5% skim,
while buying the "we never touch donations" claim.

### The current 5% model is already broken at favpoll's pledge sizes

This is the decisive fact. Stripe UK cards cost ~1.5% + 20p. The 5% fee
only covers processing when `0.05A ≥ 0.015A + £0.20` → **A ≥ ~£5.70**:

| Pledge | 5% fee | Processing (~1.5% + 20p) | favpoll net |
| --- | --- | --- | --- |
| £2 | 10p | 23p | **−13p** |
| £5 | 25p | 27.5p | **−2.5p** |
| £10 | 50p | 35p | +15p |
| £20 | £1.00 | 50p | +50p |

favpoll's mechanic encourages many small pledges (that's the point of the
record). A percentage fee on small payments loses money regardless of
strategy — so the fee model needs rework **whatever** is decided about 0%.
The question is not "can favpoll afford to drop the 5%" but "what replaces
a fee that never worked at this transaction size".

### Can favpoll afford it?

- **Forgone revenue today is £0** — pre-scale is the only moment the
  switch is free. "favpoll has never charged for donations" is a
  depreciating asset: it can only be claimed if it's true from day 1.
- **Tips decouple revenue from pledge size.** A flat 50p/£1/£2 tip prompt
  on a £3 pledge is viable where a 15p fee minus 23p processing is not.
- **favpoll is not a pure-fee platform.** The strategy doc already holds
  non-donation revenue lines: B2B funeral-director tier, printable event
  pack, stationery hero SKU, will-writing kit. A tips + B2B + physical
  goods mix affords 0% far better than a platform with nothing else.
- **The unresolved cost is processing.** Three honest framings:
  1. "100% of your pledge reaches the charity — favpoll covers the card
     fees" (strongest claim; favpoll eats ~2% + 20p, tips must cover it)
  2. "0% platform fee" with processing deducted (JustGiving wording;
     industry-standard, nobody is surprised)
  3. PPGF checkout, where PayPal has historically covered processing on
     some Giving Fund programmes — **confirm in the partnership
     conversation before relying on it**

### The interlock with §2 (this is why it matters now)

Going 0% **dissolves the "fatal" objection to PPGF Model A**. The
100%-to-charity constraint only killed Model A because of the 5% in-flow
fee. With tips as revenue (collected separately, to favpoll — exactly how
GoFundMe structures it), Model A becomes available, and it brings:

- the **full charity register from day 1** (the goodwill + coverage combo)
- Gift Aid handled by PPGF
- no Stripe Connect wait, no per-charity onboarding
- favpoll never holds charitable funds — a large compliance simplification

Cost: the pledge/live-ranking flow is built on Stripe payment intents; a
PPGF checkout is a rebuild of the payment leg (a hybrid — Stripe for the
pledge experience, PPGF for disbursement, tips kept from the Stripe leg —
remains available as Model B).

### Does it ease market expansion? Yes, materially

- PPGF operates in the **US, UK, Canada and Australia** with local charity
  vetting and tax-receipt/Gift-Aid-equivalent handling — the regulatory
  heavy lifting per market is theirs, not favpoll's. The Stripe Connect
  route means per-market charity onboarding and verification regimes
  (e.g. 501(c)(3) checks in the US).
- **0% + tips is table stakes in the US** — it's GoFundMe's home turf. A
  5% fee would read as a competitive disadvantage there; 0% removes the
  objection before it's raised.
- The i18n groundwork (en-US messages file, `formatCurrency`, market
  column) already anticipates this.

### Risks, stated honestly

- **Tip revenue is volatile** and prompt design attracts criticism when
  pushy (GoFundMe's defaults are a recurring complaint). Memorial register
  demands the quietest possible ask — flat amounts, one line, zero is
  frictionless, no exclamation marks.
- **Tips on tiny pledges look absurd as percentages** — use flat 50p/£1/£2.
- **Gift Aid monetisation is off the table forever** if the claim is
  "never charged for donations" (JustGiving's 5%-of-Gift-Aid pocket shows
  the money left behind; GoFundMe passes 100% and survives).
- **Brand surface area**: the 5% model is baked into `charity-pitch.md`,
  the brand skill ("never hide it, never apologise"), and the fee line
  donors see before confirming. A decision here triggers a coordinated
  copy pass — not piecemeal edits.

### Judgement

Recommend **adopting 0% + optional contribution, decided now, executed
before launch-scale traffic**. The current fee is underwater at typical
pledge sizes, the forgone revenue is zero, the claim is only available
once, it unlocks the PPGF/full-register path, and it removes the biggest
objection in the US. Gate the *execution* on two validations: PPGF
partnership terms (processing coverage; tips alongside donations), and a
tip-prompt design that survives the memorial register test.

---

## Recommended sequence (updated)

1. **Now** — build the admin "Add from register" typeahead (Option B).
   Improves the curated flow regardless of any strategic choice.
2. **Now** — founder decision in principle on 0% + tips (§3). Everything
   downstream (PPGF model, brand copy, US posture) branches on it.
3. **Now, in parallel** — send the PPGF partnership enquiry, asking
   specifically about: Model A vs Model B, processing-fee coverage, tips
   collected alongside donations, and market coverage (US/CA/AU). (Happy
   to draft it.)
4. **After the PPGF answer** — pick the payout rail, run the coordinated
   fee-copy pass, *then* open the register to organisers (Option C).
   Never list a charity we can't pay.
