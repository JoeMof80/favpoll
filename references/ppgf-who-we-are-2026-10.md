# favpoll — who we are

> **For PPGF.** One page, deliberately. Facts only, including the awkward ones:
> an application that oversells is the one a small team declines. Prepared
> 2026-10-15; send with, or before, the volume note.

---

## The company

**Josmo Services Limited**, registered in England and Wales, company no.
**11511585**, incorporated **10 August 2018**. Trading as **favpoll**.

Not a vehicle incorporated for this: the company predates the product by six
years.

## The product

**favpoll.com** is live. A favpoll is a poll of favourites for an occasion — a
funeral, a birthday, a wedding, a fundraising walk. Guests pick their favourite
of something (a hymn, a cake, a beach) and pledge money to a registered charity
as they do. The picks produce a standing; the money goes to the charity.

Published and in force: terms of service, privacy policy, a cookie position,
Stripe as the payment processor, Clerk for accounts.

**favpoll charges no platform fee and takes nothing from a pledge.** Our income
is an optional contribution a guest may add, shown as its own line in the
itemised total before payment, with "None" always the first option. It is never
taken from the charity's money.

## What we have built that bears on your side of it

We are asking to present charities to the public, so we have taken the
charity-data problem seriously before asking:

- **The whole Register of Charities, mirrored.** 171,886 charity profiles built
  from the Commission's bulk extract, refreshed by our own loader — name,
  status, income, address, objects, activities, classification, areas of
  operation, and the register's own working and previous names.
- **Verification runs nightly.** Every charity account is re-checked against the
  register by a scheduled job. A name that does not match is flagged for a human,
  not silently accepted.
- **A removal check that refuses.** If a charity leaves the register, our admin
  raises it above everything else — with the money pointing at it attached — and
  our code **refuses to approve that charity**. Money must not move to a
  deregistered charity, and ours cannot.
- **Names are accountable.** A charity's displayed name has to be one the
  register knows for that number — its legal name, a working name or a previous
  one. Where we show a brand name, the legal name sits beneath it.

We mention this because a small team's risk in a partner is bad charity data.
Ours is checked nightly against the source and fails closed.

## Where we actually are, plainly

- **We have raised nothing.** Not a soft launch: the pledge button is withheld
  until a charity has agreed to receive donations, and no charity has yet been
  approached. Forty-two charity accounts sit pending for that reason.
- **That was deliberate, and it is why we are talking to you.** We built the
  compliance and the register machinery first, and held back the money until the
  route to a charity was one we could stand behind. You are that route.
- **UK first.** We are aware you operate in Ireland, Canada, Australia and the
  US; we are not asking for those yet.

## What we are asking for

A partner relationship, on your standard terms.

We will do the technical work. What we need from you is the partner agreement,
the wording you require in our terms and on the donation page, and the Charity
Search API documentation. We are not asking you to design anything.

## The wording, before you ask

We have read your donor terms. We understand that a donation through a PPGF
programme is a gift to PayPal Giving Fund, a registered charity in England and
Wales (no. 1110538), for the benefit of a charity the donor suggests, and that
PPGF holds legal control over donations and grants them monthly.

We have drafted our revised terms and donation-page copy against that framing
rather than waiting to be corrected. It is attached, and it is a draft: tell us
what to change.

---

**Contact:** Joseph Moffatt — hello@favpoll.com — favpoll.com
