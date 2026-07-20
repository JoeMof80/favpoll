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
//
// New surfaces should call this rather than re-implementing the branch;
// the existing forks migrate here as they're touched.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any, any, any>

type FetchPollItemsInput = {
  pollId: string
  topicId: string
  isFinite: boolean
  /** Organiser surfaces may include hidden items; public surfaces must not */
  includeHidden?: boolean
}

export async function fetchPollItems(
  supabase: Client,
  { pollId, topicId, isFinite, includeHidden = false }: FetchPollItemsInput
): Promise<Favourite[]> {
  if (isFinite) {
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

  return ((data ?? []) as unknown as { favourites: Favourite | null }[])
    .map((row) => row.favourites)
    .filter((f): f is Favourite => Boolean(f))
}
