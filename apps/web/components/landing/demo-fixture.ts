import { SCENES } from "@/components/hero-demo-panel/scenes"
import { buildPackSteps } from "@/components/print-pack/pack-card"
import type { PackData } from "@/components/print-pack/pack-card"

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
