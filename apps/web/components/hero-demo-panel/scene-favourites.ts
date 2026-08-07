import type { Favourite } from "@favpoll/types"
import type { HeroScene } from "./scenes"

// A demo scene's results as real Favourite rows — the shape every ranking
// surface consumes. Extracted 2026-08-06 from display-screen.stories, which
// had grown its own copy of this conversion just as the landing page needed
// the same one.
//
// Note what this does NOT carry across: scene.results[].widthPercent. Bar
// widths are DERIVED by the ranking components from the pledged amounts, so
// a still built this way cannot depict a poll the product would not render —
// the demo-vs-product bar drift found in #531 is closed by construction here
// rather than by keeping two sets of numbers in step.

function parseGBP(amount: string): number {
  return parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0
}

export function sceneFavourites(
  scene: HeroScene,
  topicId: string
): Favourite[] {
  const byLabel = Object.fromEntries(
    scene.results.map((r) => {
      const pledged = parseGBP(r.amount)
      return [
        r.label,
        {
          all_time_pledged: pledged,
          // A plausible pledge count for the same money — the ranking bars
          // read amounts, but the count view and aria text want a number
          // that is not zero.
          all_time_count: Math.max(1, Math.round(pledged / 15)),
        },
      ]
    })
  )
  return scene.poll.topic.favourites.map((item, i) => ({
    id: `${topicId}-item-${i}`,
    topic_id: topicId,
    label: item.label,
    all_time_pledged: byLabel[item.label]?.all_time_pledged ?? 0,
    all_time_count: byLabel[item.label]?.all_time_count ?? 0,
    is_canonical: true,
    source: "seed" as const,
    markets: ["en-GB"],
    favpoll_count: 1,
    total_pledge_count: byLabel[item.label]?.all_time_count ?? 0,
    created_at: "2024-01-01T00:00:00Z",
  }))
}
