import { SCENES } from "@/components/hero-demo-panel/scenes"
import { buildPackSteps } from "@/components/print-pack/pack-card"
import type { PackData } from "@/components/print-pack/pack-card"
import type { KeepsakeData } from "@/components/keepsake/keepsake-document"
import { getFavpollHeadline } from "@/lib/display"

// The one demo favpoll the marketing pages depict, and the data every
// artefact of it is built from. Split out of process-overview (2026-08-07)
// when the features page needed the same card and the same screen — two
// pages assembling their own PackData from the same scene is how the numbers
// on a printed card and the numbers on a screen drift apart.
//
// The CAUSE scene (founder, 2026-08-06), not the memorial one: the most
// neutral of the four — no protagonist, so the mechanic reads as itself
// rather than as one register's story.

export const DEMO_SCENE = SCENES.find((s) => s.kind === "cause") ?? SCENES[0]

/**
 * A demo short link, in the real /p/<code> form the pack's QR encodes — 12
 * hex characters, which is what keeps the printed code at 33x33 rather than
 * the 49x49 the old /favpolls/<uuid> URL forced.
 */
export const DEMO_QR_URL = "https://favpoll.com/p/a1b2c3d4e5f6"

export const DEMO_PACK_DATA: PackData = {
  prefix: DEMO_SCENE.eyebrow ?? "A cause",
  name: DEMO_SCENE.heading ?? "",
  isCause: true,
  topicTitle: DEMO_SCENE.poll.topic.title,
  hasReveal: !!DEMO_SCENE.poll.personal_reveal,
  charityNames: DEMO_SCENE.charities.map((c) => c.name),
  qrUrl: DEMO_QR_URL,
}

export const DEMO_PACK_STEPS = buildPackSteps(DEMO_PACK_DATA)

// The keepsake the features page depicts — built from the MEMORIAL scene,
// not the cause one the rest of the page uses, for the reveal vignette's
// reason: the keepsake is most itself when there is a person. Belinda and
// purple is the exemplar the whole site uses.
//
// The prefix comes from the real getFavpollHeadline and the numbers from
// the scene's results, parsed — so the sheet this page depicts and the
// sheet the keepsake page prints cannot drift apart.

const MEMORIAL_SCENE = SCENES.find((s) => s.kind === "memorial") ?? SCENES[0]

const pounds = (formatted: string) => Number(formatted.replace(/[£,]/g, ""))

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
