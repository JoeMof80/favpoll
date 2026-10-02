"use client"

import { RoomShell } from "@/components/room-shell"
import { sceneFavourites } from "@/components/hero-demo-panel/scene-favourites"
import { DISPLAY_ROOM } from "@/lib/display"
import type { HeroScene } from "@/components/hero-demo-panel/scenes"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  Protagonist,
} from "@favpoll/types"

// THE DISPLAY AS A ROOM SEES IT, on a still (founder, 2026-08-27: "Why
// don't we make it an exact match of the real thing including the
// logo?"). Since 2026-09-30 the real thing is the favpoll page's sheet
// in its room presentation (components/room-shell), so this renders that
// — with a scene turned into the favpoll and poll the sheet reads — at
// the screen's own size, for a caller to scale into a TV frame. It is
// pixel-for-pixel the display because it IS the display.

/** The still's natural width when a caller wants a screen narrower than
 *  the room (the live vignette's non-room math). The still itself always
 *  renders at DISPLAY_STILL_ROOM. */
export const DISPLAY_STILL_WIDTH = 1120

/** The screen in the room: the display's own 1920×1080. */
export const DISPLAY_STILL_ROOM = DISPLAY_ROOM

/** How many rankings the still shows. */
const RANKS_SHOWN = 6

const WALL_NAMES = ["Priya", "Tom", null, "Aisha", "Dan"]

/**
 * A choice, not a workaround: the still keeps a goal because the
 * progress bar is the fundraiser variant at full voice, and a team walk
 * with a target is truer to the occasion than one without.
 */
const DEMO_GOAL = 1000

/**
 * Captured once at module load, not per render: the wall prints relative
 * times ("4m ago") and the rail runs a countdown, so the entries and the
 * close need a clock, and reading one during render is an impure call
 * the compiler rightly rejects. Module scope is evaluated on import, and
 * this component only ever renders client-side — its caller gates the
 * media behind `mounted` — so there is no server pass to disagree with.
 */
const STILL_BASE_TIME = Date.now()
/** Three days out: the countdown reads as an event in progress. */
const STILL_CLOSES_AT = new Date(
  STILL_BASE_TIME + 3 * 24 * 60 * 60_000
).toISOString()

export function DisplayStill({
  scene,
  qrUrl,
  wallNames = WALL_NAMES,
}: {
  scene: HeroScene
  qrUrl: string
  wallNames?: (string | null)[]
  /** Kept for callers' sake: the live vignette reserved wall rows on
   *  the old banner display. The sheet's rail sizes itself. */
  wallReserveRows?: number
  /** Kept for callers' sake: every caller renders the screen in a room
   *  (the brand mark, the gutter codes), and the still is always that. */
  room?: boolean
}) {
  const topicId = `${scene.poll.id}-topic`
  const favpollId = `${scene.poll.id}-favpoll`
  const items = sceneFavourites(scene, topicId)
  const ranked = [...items].sort(
    (a, b) => b.all_time_pledged - a.all_time_pledged
  )
  const total = items.reduce((sum, item) => sum + item.all_time_pledged, 0)

  const wall = wallNames.map((name, i) => ({
    id: `wall-${i}`,
    name,
    labels: [ranked[i % ranked.length].label],
    created_at: new Date(STILL_BASE_TIME - (i + 1) * 4 * 60_000).toISOString(),
  }))

  const isCause = !scene.protagonist
  const created_at = "2024-01-01T00:00:00Z"

  const protagonist: Protagonist | null = scene.protagonist
    ? {
        id: `${favpollId}-protagonist`,
        name: scene.protagonist.name,
        context: scene.protagonist.context,
        about: scene.protagonist.about,
        photo_url: scene.protagonist.photo_url,
        pronoun: null,
        created_by: "demo",
        created_at,
      }
    : null

  // The scene as the favpoll the sheet reads. The scene's own goal where
  // it has one (the fundraiser), the demo constant otherwise — see
  // DEMO_GOAL.
  const favpoll = {
    id: favpollId,
    protagonist_id: protagonist?.id ?? null,
    subject: isCause ? "cause" : "someone",
    cause_label: isCause ? (scene.heading ?? "") : null,
    occasion_type: scene.occasion_type,
    opening_line: scene.opening_line,
    market: "en-GB",
    created_by: "demo",
    closes_at: STILL_CLOSES_AT,
    original_closes_at: null,
    hard_close_at: null,
    extension_count: 0,
    closed_at: null,
    total_raised: total,
    // Never for a memorial: at a wake the number climbing is not the
    // point (the tribute ruling, 2026-08-02), and the sheet's charity
    // footer would otherwise shout "goal reached" under a tribute.
    goal_amount:
      scene.goal_amount ?? (scene.kind === "memorial" ? null : DEMO_GOAL),
    is_private: false,
    is_plural: null,
    description: isCause ? (scene.blurb ?? null) : null,
    photo_url: isCause ? (scene.photo_url ?? null) : null,
    context: isCause ? (scene.context ?? null) : null,
    created_at,
    protagonists: protagonist,
    favpoll_charities: scene.charities.map((c) => ({
      charities: { ...c, description: null, created_at },
    })),
  } as FavpollWithDetails

  const pollWithItems = {
    id: scene.poll.id,
    favpoll_id: favpollId,
    topic_id: topicId,
    // Never on a still: the reveal is a keepsake, not signage.
    personal_note: null,
    created_at,
    topics: {
      id: topicId,
      title: scene.poll.topic.title,
      description: null,
      is_finite: false,
      is_active: true,
      created_by: null,
      created_at,
      favourites: ranked.slice(0, RANKS_SHOWN),
    },
  } as FavpollPollWithItems

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: DISPLAY_STILL_ROOM.w, height: DISPLAY_STILL_ROOM.h }}
    >
      <RoomShell
        still
        favpoll={favpoll}
        pollWithItems={pollWithItems}
        totalRaised={total}
        wallEntries={wall}
        isClosed={false}
        manageUrl="https://favpoll.com"
        qrUrl={qrUrl}
        // THE PRESENCE DIAL, derived rather than defaulted (founder,
        // 2026-08-27: "the live display isn't in tribute mode"). The rule
        // is the product's own, from /live/[slug]: register "remembering"
        // takes tribute, everything else fundraiser. A memorial scene IS
        // the remembering register, so the scene's kind decides it and
        // the celebration and cause stills keep the louder variant.
        defaultVariant={scene.kind === "memorial" ? "tribute" : "fundraiser"}
      />
    </div>
  )
}
