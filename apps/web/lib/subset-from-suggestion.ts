import type { SupabaseClient } from "@supabase/supabase-js"

// A suggester's PROPOSED SUBSET becomes a proposed `topic_subsets` row
// (favpoll-topic-rules §1, ruling 2: admin-made — this lands as
// proposed and goes through Approve on /subsets), never a charity's
// private list. The charity's suggested subset points at it, so the
// outreach queue can confirm it the moment the admin approves the
// subset. A title already on the topic (proposed, approved or rejected)
// is reused, not duplicated.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any, any, any>

export async function proposeSubsetFromSuggestion(
  supabase: Client,
  topicId: string,
  proposal: { title: string; items: string[] },
  reason: string | null
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("topic_subsets")
    .select("id")
    .eq("topic_id", topicId)
    .ilike("title", proposal.title)
    .maybeSingle()
  if (existing?.id) return existing.id as string

  const { data: row, error } = await supabase
    .from("topic_subsets")
    .insert({
      topic_id: topicId,
      title: proposal.title,
      status: "proposed",
      source: "suggester",
      reason,
    })
    .select("id")
    .single()
  if (error || !row) return null

  const { data: favs } = await supabase
    .from("favourites")
    .select("id, label")
    .eq("topic_id", topicId)
    .in("label", proposal.items)
  const ids = ((favs ?? []) as { id: string }[]).map((f) => f.id)
  if (ids.length > 0) {
    await supabase
      .from("topic_subset_items")
      .insert(ids.map((favourite_id) => ({ subset_id: row.id, favourite_id })))
  }
  return row.id as string
}
