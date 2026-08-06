"use client"

import { DisplayScreen } from "@/components/display-screen"
import { sceneFavourites } from "@/components/hero-demo-panel/scene-favourites"
import type { HeroScene } from "@/components/hero-demo-panel/scenes"

// The live display as the closing beat of the guest arc — the REAL component,
// not a depiction of it.
//
// This was a hand-built reduction until 2026-08-06: a simplified banner over
// the shared ranking parts, on the reasoning that a visible reduction cannot
// drift the way a copy does. True as far as it goes, but the founder asked
// the better question — why not show the actual display? — and the answer
// turned out to be cheap: DisplayScreen takes `live={false}` and drops the
// three behaviours that only make sense on a screen someone is presenting
// from. Nine required props, all of which a demo scene already carries.
//
// So there is now ONE definition of the display. Whatever changes there
// changes here, including the parts a reduction would have quietly lost —
// the goal-free "Raised so far" silhouette, the charity rows, the guest wall,
// the two-column banner.

/** Rendered at this width, then scaled by the caller — see the note there. */
export const DISPLAY_STILL_WIDTH = 900

/**
 * Leaders shown. The real display lists every favourite, including the ones
 * on £0 — correct there, and four empty bars in a marketing still. Sorted
 * before slicing: sceneFavourites returns the topic's own (alphabetical)
 * order, so an unsorted slice once dropped the £240 leader entirely and
 * handed the 100% bar to the runner-up.
 */
const RANKS_SHOWN = 6

/** A display mid-event has pledges on its wall; an empty one reads as broken. */
const WALL_NAMES = ["Priya", "Tom", null, "Aisha", "Dan"]

/**
 * Captured once at module load, not per render: the wall prints relative
 * times ("4m ago"), so the entries need a clock, and reading one during
 * render is an impure call the compiler rightly rejects. Module scope is
 * evaluated on import, and this component only ever renders client-side —
 * its caller gates the media behind `mounted` — so there is no server pass
 * to disagree with.
 */
const WALL_BASE_TIME = Date.now()

export function DisplayStill({
  scene,
  qrUrl,
}: {
  scene: HeroScene
  qrUrl: string
}) {
  const topicId = `${scene.poll.id}-topic`
  const items = sceneFavourites(scene, topicId)
  // The TOTAL counts everything; the LIST shows the leaders.
  const ranked = [...items].sort(
    (a, b) => b.all_time_pledged - a.all_time_pledged
  )
  const total = items.reduce((sum, item) => sum + item.all_time_pledged, 0)

  const wall = WALL_NAMES.map((name, i) => ({
    id: `wall-${i}`,
    name,
    labels: [ranked[i % ranked.length].label],
    created_at: new Date(WALL_BASE_TIME - (i + 1) * 4 * 60_000).toISOString(),
  }))

  return (
    <div style={{ width: DISPLAY_STILL_WIDTH }}>
      <DisplayScreen
        live={false}
        protagonistName={scene.heading ?? ""}
        dateLabel={null}
        openingLine={scene.opening_line}
        occasionType={scene.occasion_type}
        charityName={scene.charities[0]?.name ?? null}
        // Scene charities carry the fields a demo needs; Charity also wants
        // `description` and `created_at`, which no scene has and the display
        // never shows.
        charities={scene.charities.map((c) => ({
          ...c,
          description: null,
          created_at: "2024-01-01T00:00:00Z",
        }))}
        poll={{
          id: scene.poll.id,
          // The reveal is the witnessed finale on the real display and types
          // out only at the close; a still is not that moment.
          personal_reveal: null,
          topic: { id: topicId, title: scene.poll.topic.title },
          items: ranked.slice(0, RANKS_SHOWN),
        }}
        initialWallEntries={wall}
        initialTotalRaised={total}
        favpollUrl="https://favpoll.com"
        qrUrl={qrUrl}
      />
    </div>
  )
}
