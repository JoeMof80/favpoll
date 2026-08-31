import { SCENES } from "@/components/hero-demo-panel/scenes"
import { buildPackSteps } from "@/components/print-pack/pack-card"
import { isMessageReveal } from "@/lib/mechanic-steps"
import type { PackData } from "@/components/print-pack/pack-card"
import type { TopicPickerScene } from "@/components/landing/topic-picker-vignette"
import type { KeepsakeData } from "@/components/keepsake/keepsake-document"
import { getFavpollHeadline } from "@/lib/display"

// The one demo favpoll the marketing pages depict, and the data every
// artefact of it is built from. Split out of process-overview (2026-08-07)
// when the features page needed the same card and the same screen — two
// pages assembling their own PackData from the same scene is how the numbers
// on a printed card and the numbers on a screen drift apart.
//
// THE CAUSE SCENE AGAIN (founder, 2026-08-31). It was the cause from
// 2026-08-06 — the most neutral of the four, no protagonist, the mechanic
// read as itself — and moved to Poppy's Sweet Sixteen on 2026-08-17 because
// the journey had gained a reveal beat and a keepsake beat, and the cause's
// reveal was "Hospice care is free…": a fact about a charity, nothing
// revealed. Two things changed. The celebration page now carries that
// exemplar itself, so home was showing the same favpoll twice; and the cause
// now OWNS a real favourite — Biscuit, the hospice's therapy dog, a beagle —
// which is true on day one, so the reveal beat reveals something. The
// keepsake beat still falls back to the quieter of its two tellings (nobody
// to lead on); that is the cost, and it is the honest picture of a cause.
//
// The hospice is fictional for now (St Mark's); see the scene's note.
export const DEMO_SCENE = SCENES.find((s) => s.kind === "cause") ?? SCENES[0]

// Derived rather than literal: `heading` and `eyebrow` exist ONLY on the
// faceless cause scene, so a protagonist scene has to get its prefix the way
// the product does — from the register.
const DEMO_HEADLINE = getFavpollHeadline({
  occasionType: DEMO_SCENE.occasion_type,
  name: DEMO_SCENE.protagonist?.name ?? DEMO_SCENE.heading ?? "",
  subject: DEMO_SCENE.protagonist ? "someone" : "cause",
  openingLine: DEMO_SCENE.opening_line,
})

/**
 * A demo short link, in the real /p/<code> form the pack's QR encodes — 12
 * hex characters, which is what keeps the printed code at 33x33 rather than
 * the 49x49 the old /favpolls/<uuid> URL forced.
 */
export const MEMORIAL_SCENE =
  SCENES.find((s) => s.kind === "memorial") ?? SCENES[0]

/**
 * The celebration register's exemplar (founder, 2026-08-28) — Alex & Jordan's
 * wedding, favourite holiday destination, WWF-UK.
 *
 * Found by OCCASION TYPE, not by kind: there are two celebration scenes now,
 * and `find(kind === "celebration")` returns whichever comes first in SCENES.
 * DEMO_SCENE above deliberately still resolves to Poppy's birthday, because
 * the home walkthrough and /features run on it and this change is scoped to
 * the register page.
 */
/**
 * The fundraiser register's exemplar (founder, 2026-08-28) — Marcus Bell's
 * London Marathon, favourite hat, Mind.
 *
 * MARCUS RATHER THAN THE CAUSE SCENE, and the reason is structural. This
 * register holds two shapes: a person doing a sponsored challenge, who keeps
 * a protagonist, and a faceless cause, which has none. The four-artefact band
 * turns on there being someone whose answer is worth revealing — a cause has
 * no personal reveal at all, so its strongest beat would have nothing to
 * magnify. The page still has to read true for a cause, but that is a copy
 * problem rather than an artefact one.
 *
 * Found by kind, which is unambiguous: he is the only "fundraiser" scene,
 * where the cause scene carries kind "cause".
 */
export const FUNDRAISER_SCENE =
  SCENES.find((s) => s.kind === "fundraiser") ?? SCENES[0]

export const WEDDING_SCENE =
  SCENES.find((s) => s.occasion_type === "Wedding") ?? SCENES[0]

export const DEMO_QR_URL = "https://favpoll.com/p/a1b2c3d4e5f6"

export const DEMO_PACK_DATA: PackData = {
  prefix: DEMO_HEADLINE.prefix,
  name: DEMO_HEADLINE.name,
  isCause: !DEMO_SCENE.protagonist,
  topicTitle: DEMO_SCENE.poll.topic.title,
  hasReveal: !!DEMO_SCENE.poll.personal_reveal,
  revealIsMessage: isMessageReveal(
    DEMO_SCENE.poll.personal_reveal,
    DEMO_SCENE.poll.topic.favourites.map((f) => f.label)
  ),
  charityNames: DEMO_SCENE.charities.map((c) => c.name),
  qrUrl: DEMO_QR_URL,
}

export const DEMO_PACK_STEPS = buildPackSteps(DEMO_PACK_DATA)

/**
 * The same pack, for the MEMORIAL scene — Belinda Hartley, favourite
 * colour, Marie Curie.
 *
 * /features is register-neutral and keeps the celebration pack above.
 * /memorials cannot: a page a celebrant forwards to a bereaved family
 * showed a printed birthday card for Poppy Chen, and beside it Belinda's
 * reveal and Belinda's keepsake — two unrelated favpolls told as one
 * story (2026-08-26).
 *
 * The homepage's memorial router card already carries Belinda's charity
 * and her exact total, so one favpoll now runs from that card through
 * every object on the page.
 */
const MEMORIAL_HEADLINE = getFavpollHeadline({
  occasionType: MEMORIAL_SCENE.occasion_type,
  name: MEMORIAL_SCENE.protagonist?.name ?? "",
  subject: "someone",
  openingLine: MEMORIAL_SCENE.opening_line,
})

export const MEMORIAL_PACK_DATA: PackData = {
  prefix: MEMORIAL_HEADLINE.prefix,
  name: MEMORIAL_HEADLINE.name,
  isCause: false,
  topicTitle: MEMORIAL_SCENE.poll.topic.title,
  hasReveal: !!MEMORIAL_SCENE.poll.personal_reveal,
  revealIsMessage: isMessageReveal(
    MEMORIAL_SCENE.poll.personal_reveal,
    MEMORIAL_SCENE.poll.topic.favourites.map((f) => f.label)
  ),
  charityNames: MEMORIAL_SCENE.charities.map((c) => c.name),
  qrUrl: DEMO_QR_URL,
}

export const MEMORIAL_PACK_STEPS = buildPackSteps(MEMORIAL_PACK_DATA)

/** The same pack for the WEDDING scene — Alex & Jordan, destinations, WWF. */
const WEDDING_HEADLINE = getFavpollHeadline({
  occasionType: WEDDING_SCENE.occasion_type,
  name: WEDDING_SCENE.protagonist?.name ?? "",
  subject: "someone",
  openingLine: WEDDING_SCENE.opening_line,
})

export const WEDDING_PACK_DATA: PackData = {
  prefix: WEDDING_HEADLINE.prefix,
  name: WEDDING_HEADLINE.name,
  isCause: false,
  topicTitle: WEDDING_SCENE.poll.topic.title,
  hasReveal: !!WEDDING_SCENE.poll.personal_reveal,
  revealIsMessage: isMessageReveal(
    WEDDING_SCENE.poll.personal_reveal,
    WEDDING_SCENE.poll.topic.favourites.map((f) => f.label)
  ),
  charityNames: WEDDING_SCENE.charities.map((c) => c.name),
  qrUrl: DEMO_QR_URL,
}

export const WEDDING_PACK_STEPS = buildPackSteps(WEDDING_PACK_DATA)

// The keepsake the features page depicts — built from the MEMORIAL scene,
// not the cause one the rest of the page uses, for the reveal vignette's
// reason: the keepsake is most itself when there is a person. Belinda and
// purple is the exemplar the whole site uses.
//
// The prefix comes from the real getFavpollHeadline and the numbers from
// the scene's results, parsed — so the sheet this page depicts and the
// sheet the keepsake page prints cannot drift apart.

const pounds = (formatted: string) => Number(formatted.replace(/[£,]/g, ""))

// The keepsake for the HOME WALKTHROUGH, built from the SAME scene the rest of
// that walkthrough runs on (2026-08-17, when a keepsake beat was added to How
// It Works). Not DEMO_KEEPSAKE_DATA below: that one is Belinda's, and a
// memorial sheet arriving after six beats about somebody's birthday is exactly
// the drift this file exists to prevent — one favpoll, one set of numbers,
// every artefact of it built from the same scene.
export const DEMO_KEEPSAKE_WALKTHROUGH_DATA: KeepsakeData = {
  prefix: DEMO_HEADLINE.prefix,
  name: DEMO_HEADLINE.name,
  context: DEMO_SCENE.protagonist?.context ?? DEMO_SCENE.context ?? null,
  topicTitle: DEMO_SCENE.poll.topic.title,
  reveal: DEMO_SCENE.poll.personal_reveal,
  totalRaised: pounds(DEMO_SCENE.total),
  charityNames: DEMO_SCENE.charities.map((c) => c.name),
  // House format: ordinal, never ISO. A Sweet Sixteen, so the favpoll closed
  // a few days after the party.
  closedDate: "9th May 2026",
  standings: DEMO_SCENE.results.map((r) => ({
    favouriteId:
      DEMO_SCENE.poll.topic.favourites.find((f) => f.label === r.label)?.id ??
      r.label,
    label: r.label,
    amount: pounds(r.amount),
  })),
  rankHistory: null,
  goalAmount: null,
  guestNames: [],
}

export const DEMO_KEEPSAKE_DATA: KeepsakeData = {
  prefix: getFavpollHeadline({
    occasionType: MEMORIAL_SCENE.occasion_type,
    name: MEMORIAL_SCENE.protagonist?.name ?? "",
    subject: "someone",
    openingLine: MEMORIAL_SCENE.opening_line,
  }).prefix,
  name: MEMORIAL_SCENE.protagonist?.name ?? "",
  context: MEMORIAL_SCENE.protagonist?.context ?? null,
  topicTitle: MEMORIAL_SCENE.poll.topic.title,
  reveal: MEMORIAL_SCENE.poll.personal_reveal,
  totalRaised: pounds(MEMORIAL_SCENE.total),
  charityNames: MEMORIAL_SCENE.charities.map((c) => c.name),
  // The scene carries no dates; Belinda's context ends in 2024, so the
  // favpoll closed that year. House format: ordinal, never ISO.
  closedDate: "21st November 2024",
  standings: MEMORIAL_SCENE.results.map((r) => ({
    favouriteId:
      MEMORIAL_SCENE.poll.topic.favourites.find((f) => f.label === r.label)
        ?.id ?? r.label,
    label: r.label,
    amount: pounds(r.amount),
  })),
  rankHistory: null,
  goalAmount: null,
  guestNames: [],
}

/** And the keepsake, so every object on /celebrations is the same favpoll. */
export const WEDDING_KEEPSAKE_DATA: KeepsakeData = {
  prefix: WEDDING_HEADLINE.prefix,
  name: WEDDING_HEADLINE.name,
  context: WEDDING_SCENE.protagonist?.context ?? null,
  topicTitle: WEDDING_SCENE.poll.topic.title,
  reveal: WEDDING_SCENE.poll.personal_reveal,
  totalRaised: pounds(WEDDING_SCENE.total),
  charityNames: WEDDING_SCENE.charities.map((c) => c.name),
  // House format: ordinal, never ISO. The favpoll closed a few days after
  // the wedding.
  closedDate: "20th September 2026",
  standings: WEDDING_SCENE.results.map((r) => ({
    favouriteId:
      WEDDING_SCENE.poll.topic.favourites.find((f) => f.label === r.label)
        ?.id ?? r.label,
    label: r.label,
    amount: pounds(r.amount),
  })),
  rankHistory: null,
  goalAmount: null,
  guestNames: [],
}

/**
 * The keepsake, so every object on /fundraisers is the same favpoll.
 *
 * The headline survives alone here. /fundraisers dropped its poster for a
 * share artefact (2026-08-29), which took FUNDRAISER_PACK_DATA and _STEPS
 * with it — this page prints nothing now — but the keepsake still needs the
 * "In support of / Marcus Bell" split that getFavpollHeadline works out.
 */
const FUNDRAISER_HEADLINE = getFavpollHeadline({
  occasionType: FUNDRAISER_SCENE.occasion_type,
  name: FUNDRAISER_SCENE.protagonist?.name ?? "",
  subject: "someone",
  openingLine: FUNDRAISER_SCENE.opening_line,
})

export const FUNDRAISER_KEEPSAKE_DATA: KeepsakeData = {
  prefix: FUNDRAISER_HEADLINE.prefix,
  name: FUNDRAISER_HEADLINE.name,
  context: FUNDRAISER_SCENE.protagonist?.context ?? null,
  topicTitle: FUNDRAISER_SCENE.poll.topic.title,
  reveal: FUNDRAISER_SCENE.poll.personal_reveal,
  totalRaised: pounds(FUNDRAISER_SCENE.total),
  charityNames: FUNDRAISER_SCENE.charities.map((c) => c.name),
  // House format: ordinal, never ISO. The favpoll closed the week AFTER the
  // race, and that is load-bearing rather than incidental: the hat is taken
  // from whichever is leading on race morning, not from the close, so the
  // poll runs through the marathon and collects the sponsorship that lands
  // once he has finished. A date before the race would contradict the About.
  closedDate: "3rd May 2026",
  standings: FUNDRAISER_SCENE.results.map((r) => ({
    favouriteId:
      FUNDRAISER_SCENE.poll.topic.favourites.find((f) => f.label === r.label)
        ?.id ?? r.label,
    label: r.label,
    amount: pounds(r.amount),
  })),
  rankHistory: null,
  goalAmount: null,
  guestNames: [],
}

/**
 * What the topic picker shows on /fundraisers — Marcus's own hat topic, so
 * the dialog holds the favpoll the rest of the page holds.
 *
 * ALL EIGHT, where /features types three. This one is rendered STILL, so
 * nothing is typed and the whole list can sit there as chips — which is the
 * better picture anyway, because the standings two rows below show eight and
 * a dialog showing three would look like a different poll. If this ever goes
 * back to animating, cut it: the animated path types every item in turn.
 *
 * `guestItem` is unused while still (it belongs to the third dialog, which a
 * still does not render) and is kept so the scene stays whole.
 *
 * Module-level, as TopicPickerScene requires: the animation effect depends on
 * this reference, so an inline literal would restart the sequence every
 * render.
 */
export const FUNDRAISER_TOPIC_PICKER: TopicPickerScene = {
  topic: FUNDRAISER_SCENE.poll.topic.title,
  items: [
    "Sombrero",
    "Viking helmet",
    "Fez",
    "Top hat",
    "Deerstalker",
    "Beret",
    "Bowler",
    "Stetson",
  ],
  guestItem: "Deerstalker",
}
