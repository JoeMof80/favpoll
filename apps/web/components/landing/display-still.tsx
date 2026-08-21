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
// the goal-free "Raised so far" silhouette, the charity rows, the wall of favourites,
// the two-column banner.

/**
 * Rendered at this width, then scaled by the caller — see the note there.
 *
 * 900 -> 1120 (2026-08-18). The display's body only splits into standings +
 * sidebar at 64rem, so at 900 the still never reached its own two-column form:
 * it stacked the QR and the wall UNDER the standings and came out portrait,
 * 900 x 1097, which reads as a tablet rather than a screen on a wall. The
 * breakpoints are container queries now, so the number that decides this is
 * this one — the box the still is rendered in — rather than the visitor's
 * window. 1120 clears 64rem with room for the surround's own padding.
 */
export const DISPLAY_STILL_WIDTH = 1120

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
 * A choice, not a workaround. Rendering this still with neither a goal nor a
 * close date is what exposed the display's empty-banner bug — the fundraiser
 * column used to render nothing at all in that case — and that is now fixed
 * in DisplayScreen itself, so the still would read correctly without this.
 * It keeps a goal because the progress bar is the fundraiser variant at full
 * voice, and a team walk with a target is truer to the occasion than one
 * without.
 */
const DEMO_GOAL = 1000

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
  wallNames = WALL_NAMES,
}: {
  scene: HeroScene
  qrUrl: string
  /**
   * Override the wall entries. Only /features' live artefact passes this, to
   * grow the wall a name at a time as its pledges land — the still is
   * otherwise a fixed picture and every other caller wants that.
   */
  wallNames?: (string | null)[]
}) {
  const topicId = `${scene.poll.id}-topic`
  const items = sceneFavourites(scene, topicId)
  // The TOTAL counts everything; the LIST shows the leaders.
  const ranked = [...items].sort(
    (a, b) => b.all_time_pledged - a.all_time_pledged
  )
  const total = items.reduce((sum, item) => sum + item.all_time_pledged, 0)

  const wall = wallNames.map((name, i) => ({
    id: `wall-${i}`,
    name,
    labels: [ranked[i % ranked.length].label],
    created_at: new Date(WALL_BASE_TIME - (i + 1) * 4 * 60_000).toISOString(),
  }))

  return (
    <div style={{ width: DISPLAY_STILL_WIDTH }}>
      <DisplayScreen
        live={false}
        // protagonist FIRST, heading only as the fallback (founder,
        // 2026-08-21: "the Happy Birthday feels redundant"). It was not
        // redundant, it was orphaned: `heading` is documented as the h1 for
        // NO-protagonist scenes, so on a scene that has one the name resolved
        // to "" and the display rendered a bare "HAPPY BIRTHDAY" prefixing
        // nothing. demo-fixture had already been doing it this way for the
        // same scene. Affects the homepage walkthrough as well as /features.
        protagonistName={scene.protagonist?.name ?? scene.heading ?? ""}
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
        goalAmount={DEMO_GOAL}
        favpollUrl="https://favpoll.com"
        qrUrl={qrUrl}
      />
    </div>
  )
}
