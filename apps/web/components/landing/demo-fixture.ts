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
// THE CELEBRATION SCENE (founder, 2026-08-17). It was the CAUSE one from
// 2026-08-06, chosen as the most neutral of the four — no protagonist, so the
// mechanic read as itself rather than as one register's story. Two things
// broke that: the walkthrough gained a keepsake beat, and its reveal beat now
// names the personal reveal. A faceless scene can do neither. Its
// `personal_reveal` field held "Hospice care is free…" — a fact about a
// charity — so the section taught favpoll's most distinctive mechanic using
// its least distinctive instance, and a keepsake with nobody to lead on falls
// back to the quieter of its two tellings.
//
// Celebration rather than memorial: Poppy's Sweet Sixteen has a protagonist
// and a true first-person reveal ("Mint choc chip is the best, of course"),
// without teaching favpoll through a funeral at the top of the funnel — the
// overclaim the headline history keeps correcting. Belinda and purple still
// carry the memorial exemplar on the reveal vignette and the features
// keepsake, so the site shows both.
//
// KNOWN COST: St Luke's is a hospice prospect, and the cause scene was picked
// partly so the example most visitors read would name them. That is now only
// on the register pages. Reverse this one line if that trade stops being
// worth it.
export const DEMO_SCENE =
  SCENES.find((s) => s.kind === "celebration") ?? SCENES[0]

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

/** The same pack for the FUNDRAISER scene — Marcus, hats, Mind. */
const FUNDRAISER_HEADLINE = getFavpollHeadline({
  occasionType: FUNDRAISER_SCENE.occasion_type,
  name: FUNDRAISER_SCENE.protagonist?.name ?? "",
  subject: "someone",
  openingLine: FUNDRAISER_SCENE.opening_line,
})

export const FUNDRAISER_PACK_DATA: PackData = {
  prefix: FUNDRAISER_HEADLINE.prefix,
  name: FUNDRAISER_HEADLINE.name,
  isCause: false,
  topicTitle: FUNDRAISER_SCENE.poll.topic.title,
  hasReveal: !!FUNDRAISER_SCENE.poll.personal_reveal,
  revealIsMessage: isMessageReveal(
    FUNDRAISER_SCENE.poll.personal_reveal,
    FUNDRAISER_SCENE.poll.topic.favourites.map((f) => f.label)
  ),
  charityNames: FUNDRAISER_SCENE.charities.map((c) => c.name),
  qrUrl: DEMO_QR_URL,
}

export const FUNDRAISER_PACK_STEPS = buildPackSteps(FUNDRAISER_PACK_DATA)

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
  guestNames: [],
}

/** And the keepsake, so every object on /fundraisers is the same favpoll. */
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
  guestNames: [],
}

/**
 * What the topic picker types on /fundraisers — Marcus's own hat topic, so
 * the dialogs show the favpoll the rest of the page shows.
 *
 * THREE ITEMS, NOT THE POLL'S EIGHT. The vignette depicts the mechanic, not a
 * transcript: three typed by the organiser and one added by a guest is enough
 * to show both halves of it, and eight would make the sequence outlast anyone
 * watching. The guest's is "Lucky 2p" — small, specific and exactly the kind
 * The guest's is the deerstalker — specific, a bit obscure, and exactly the
 * kind of thing an organiser does not think of, which is the whole reason
 * guests can add.
 *
 * Module-level, as TopicPickerScene requires: the animation effect depends on
 * this reference, so an inline literal would restart the sequence every
 * render.
 */
export const FUNDRAISER_TOPIC_PICKER: TopicPickerScene = {
  topic: FUNDRAISER_SCENE.poll.topic.title,
  items: ["Sombrero", "Viking helmet", "Fez"],
  guestItem: "Deerstalker",
}
