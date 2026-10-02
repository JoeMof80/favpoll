import type { SupabaseClient } from "@supabase/supabase-js"
import type { Favourite } from "@favpoll/types"

// The item list for a poll — ONE rule, shared (the 2026-07-20 survey found
// this forked five ways, and a sixth surface — the live display — reading
// the whole topic canon instead):
//
//   - a FINITE topic's items are the topic's closed set (such polls carry
//     no favpoll_poll_favourites rows)
//   - an INFINITE topic's items are its curated favpoll_poll_favourites
//     rows (hidden rows excluded on public surfaces)
//   - a SUBSET poll (favpoll-topic-rules §1) always carries its rows — the
//     subset's members — whatever the parent's openness, so it reads like
//     an infinite one
//
// New surfaces should call this rather than re-implementing the branch;
// the existing forks migrate here as they're touched.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any, any, any>

type FetchPollItemsInput = {
  pollId: string
  topicId: string
  isFinite: boolean
  /** The poll's subset, when it was made with one: its rows are the list. */
  subsetId?: string | null
  /** Organiser surfaces may include hidden items; public surfaces must not */
  includeHidden?: boolean
}

export async function fetchPollItems(
  supabase: Client,
  {
    pollId,
    topicId,
    isFinite,
    subsetId = null,
    includeHidden = false,
  }: FetchPollItemsInput
): Promise<Favourite[]> {
  if (isFinite && !subsetId) {
    const { data } = await supabase
      .from("favourites")
      .select("*")
      .eq("topic_id", topicId)
    return (data ?? []) as Favourite[]
  }

  let query = supabase
    .from("favpoll_poll_favourites")
    .select("is_hidden, favourites (*)")
    .eq("favpoll_poll_id", pollId)
  if (!includeHidden) {
    query = query.eq("is_hidden", false)
  }
  const { data } = await query
  const linked = ((data ?? []) as unknown as { favourites: Favourite | null }[])
    .map((row) => row.favourites)
    .filter((f): f is Favourite => Boolean(f))
  if (linked.length > 0) return linked
  // No rows of its own: the poll runs on the topic's whole catalogue —
  // the favpoll page's rule (app/favpolls/[id]/page.tsx), which the
  // display and the note route lacked (found 2026-09-30: a seeded
  // favpoll with eight pledges projected an empty standings list).
  const { data: catalogue } = await supabase
    .from("favourites")
    .select("*")
    .eq("topic_id", topicId)
  return (catalogue ?? []) as Favourite[]
}
