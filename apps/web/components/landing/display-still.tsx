"use client"

import { BrandedQR } from "@/components/branded-qr"
import { DisplayPollSection } from "@/components/display-screen/display-poll-section"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { sceneFavourites } from "@/components/hero-demo-panel/scene-favourites"
import { heroNameSizeClass } from "@/lib/display"
import { formatPounds } from "@/lib/i18n"
import type { HeroScene } from "@/components/hero-demo-panel/scenes"

// The live display, as the closing frame of the guest arc — a still, not the
// real DisplayScreen.
//
// DisplayScreen is a LIVE surface: it refreshes its own server data every
// five seconds (postgres_changes never reach the anon browser, so the page
// re-pulls instead), adopts a stored variant from localStorage and arms a
// close countdown. None of that belongs on the landing page, and a
// homepage that refreshed the route every five seconds would be a bug.
//
// This is deliberately a REDUCTION, and the distinction matters: the four
// defects named on 2026-08-06 were each two things claiming to be the same
// and quietly differing. A still that obviously shows less cannot drift that
// way. What it does NOT restate is the part that carries meaning — the topic
// header and the ranking bars come through DisplayPollSection, the code
// through BrandedQR — so the leader still normalises to 100% here because
// the same components compute it, not because a number was copied across.
//
// Rendered at a fixed 900px and scaled by the caller: the display is a
// desktop layout (max-w-6xl, md: two-column banner), so laying it out at
// column width would collapse it into its mobile form and stop it reading as
// a screen in a room. 900 keeps the md: banner and, at the ~0.44 fit-scale a
// third of the page grid allows, puts the 18px bar labels at about 8px —
// smaller than the phone steps before it, which is right for something being
// read across a room rather than in the hand.

export const DISPLAY_STILL_WIDTH = 900

export function DisplayStill({
  scene,
  qrUrl,
}: {
  scene: HeroScene
  qrUrl: string
}) {
  const topicId = `${scene.poll.id}-topic`
  const items = sceneFavourites(scene, topicId)
  const total = items.reduce((sum, item) => sum + item.all_time_pledged, 0)
  const charityName = scene.charities[0]?.name ?? null

  return (
    // The event page's frame at broadcast width, as the real display wears
    // it: tinted surround, floating card.
    <div
      className="flex flex-col bg-primary/5"
      style={{ width: DISPLAY_STILL_WIDTH }}
    >
      <div className="mx-auto flex w-full flex-1 flex-col bg-background px-12 py-8 drop-shadow-lg">
        {/* Banner — the fundraiser variant's silhouette, reduced: eyebrow,
            the figure, the QR beside it, and the charity it is for. No goal
            bar, no countdown, no per-charity rows. */}
        <div className="mb-8 flex items-start gap-8 border-b border-border pb-6">
          <div className="min-w-0 flex-1">
            <SectionEyebrow variant="muted" className="flex h-8 items-center">
              Raised so far
            </SectionEyebrow>
            <p
              className={`leading-tight font-medium tracking-tight text-foreground ${heroNameSizeClass}`}
            >
              {formatPounds(total)}
            </p>
            {charityName && (
              <p className="mt-2 text-lg text-muted-foreground">
                for {charityName}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <BrandedQR
              value={qrUrl}
              size={132}
              colorVar="--qr"
              aria-label="Scan to pledge on your phone"
            />
            <p className="text-sm font-medium text-qr">Scan to pledge</p>
          </div>
        </div>

        <DisplayPollSection
          poll={{
            id: scene.poll.id,
            // The reveal is the witnessed finale on the real display and
            // only types out at the close; a still is not that moment.
            personal_reveal: null,
            topic: { id: topicId, title: scene.poll.topic.title },
            items,
          }}
        />
      </div>
    </div>
  )
}
