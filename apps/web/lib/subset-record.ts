import type { Favourite, TopicSubsetTotal } from "@favpoll/types"

// A SUBSET'S RECORD (favpoll-topic-rules §1, ruling 4 as revised
// 2026-09-28): a pick says only "this beats everything on the list I was
// shown". So the parent's record counts whole-list favpolls only (the
// favourite row's all-time totals, kept that way by the totals trigger),
// and a subset's record is its own favpolls' picks (topic_subset_totals)
// PLUS its members' picks from the parent's whole-list favpolls. Down,
// never up. Summed here at read time; never stored twice.

export function subsetStanding(
  parentFavourites: Favourite[],
  memberIds: Iterable<string>,
  scoped: Pick<
    TopicSubsetTotal,
    "favourite_id" | "all_time_pledged" | "all_time_count"
  >[]
): Favourite[] {
  const members = new Set(memberIds)
  const own = new Map(scoped.map((t) => [t.favourite_id, t]))
  return parentFavourites
    .filter((f) => members.has(f.id))
    .map((f) => {
      const s = own.get(f.id)
      return {
        ...f,
        all_time_pledged: f.all_time_pledged + Number(s?.all_time_pledged ?? 0),
        all_time_count: f.all_time_count + (s?.all_time_count ?? 0),
      }
    })
    .sort((a, b) => b.all_time_pledged - a.all_time_pledged)
}
