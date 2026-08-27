# Android device test — Google Pay + the guest arc

**With David, ____________.** Borrowed phone: assume ONE go at it.

Android has never been tested on any surface. Google Pay has never been
tested on a device at all — the 21 July verification was API-only. The
outstanding real-device pass in `outstanding-tasks-2026-07.md` §1 was
scoped to an iPhone.

---

## Before you travel

☐ **Ask David to check he has a card in his Google account.** Google Pay
  will not offer itself otherwise, and you will conclude the button is
  broken when it is only empty. Do this a day ahead, not in the pub.

☐ **Pick the favpoll you'll use and write the short link here:**

  `https://favpoll-web-gamma.vercel.app/p/` ______________

  Use a real exemplar — **Stanley** (memorial, Favourite Dog breed) is
  the closest to the real thing. NOT an E2E test favpoll.

☐ **Print the card.** `/favpolls/<id>/pack` — the whole point is a guest
  scanning paper, not you sending a link. A pasted URL skips the first
  and least-tested step of the arc.

☐ Phone charged, and know how to screen-record on Android (Quick
  Settings → Screen record). Record the pledge step.

---

## Say this to David first

> "This is test mode — no money moves, nothing is charged. If your bank
> app pings, tell me, because that would be a genuine bug."

Production runs the FavPoll-sandbox **test** Stripe keys today. That is
what the launch flip changes.

---

## The known wrinkle — do not chase it

In test mode Stripe can throw an error **because** a real card is being
used against a test key. If the sheet opens and then errors at the
token step, that is a **test-mode artefact, not a favpoll bug.**

**What you are testing is whether the button RENDERS and the sheet
OPENS.** That is the unknown, and it is independent of the card.

If you want the token step to complete too: add a card from Google's
test card suite to David's wallet beforehand.

☐ Fallback prepared?

---

## The arc — in order, as a guest

**1 · Scan the printed card**

☐ Camera recognises the QR at arm's length, first try
☐ Lands on the favpoll (not a 404, not a holding page)

Time from scan to readable page: ______ seconds

Notes: ______________________________________________________________

**2 · The event page on Android**

☐ Nothing clipped, nothing scrolling sideways
☐ Hero readable · photo loads · countdown correct
☐ Ranking bars render

Notes: ______________________________________________________________

_____________________________________________________________________

**3 · Pick a favourite**

☐ Picker opens and is usable one-handed
☐ Search works with the Android keyboard up
☐ **Does the keyboard cover the list or the buttons?** ← the classic

Notes: ______________________________________________________________

**4 · Amount**

☐ Amount step readable, tip options clear
☐ Numeric keypad appears for a custom amount

Notes: ______________________________________________________________

**5 · Pay — THE MAIN EVENT**

☐ **Google Pay button appears in the Payment Element**  ← the answer
   you came for

☐ Card fields also present (fallback intact)
☐ Tapping Google Pay opens the Google sheet
☐ Sheet shows the right amount and merchant name: ___________________
☐ Completing returns to favpoll cleanly
☐ Pledge appears on the page

**If the button does NOT appear, capture before leaving:**
- Chrome version: ____________  Android version: ____________
- Any console error (Chrome → chrome://inspect from a laptop, if you
  brought one)
- Does it appear on the SAME phone at stripe.com's own demo? That
  separates "our integration" from "this device"

Notes: ______________________________________________________________

_____________________________________________________________________

**6 · The reveal**

☐ Reveal appears after pledging, and reads properly on the phone
☐ It lands emotionally — watch David's face, not the screen

Notes: ______________________________________________________________

---

## While you have a real Android in your hand

You are unlikely to borrow it again soon. Ten minutes more:

☐ Home page — the hero, the How It Works section (reworked this month,
  measured at 320/390/430 but never on Android)
☐ Mobile menu — dropdown, blur, account rows
☐ `/features` — the section that fought back hardest on mobile
☐ Any page scrolling sideways? Anything cut off mid-word?
☐ Dark mode — flip the system theme and re-check the pledge flow

Worst thing seen: _____________________________________________________

_____________________________________________________________________

---

## Afterwards — same day

- Write it up in `outstanding-tasks-2026-07.md` §1 (real-device pass).
- If Google Pay rendered: it clears the one item on launch checklist
  step 8 currently marked as never verified on a device.
- If it did not: that is a launch blocker, and better found this weekend
  than on the day.
- Screen recording somewhere you can find it again.
